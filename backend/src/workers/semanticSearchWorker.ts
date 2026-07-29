import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Octokit } from 'octokit';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API;
const isOrKey = apiKey?.startsWith('sk-or');
const openai = new OpenAI({ 
  apiKey,
  baseURL: isOrKey ? 'https://openrouter.ai/api/v1' : undefined
});

const CHUNK_SIZE = 2000; // max characters per chunk roughly

export async function processSemanticSearchJob(job: Job) {
  const { repoId } = job.data;
  if (!repoId) throw new Error("repoId is required");

  console.log(`Starting semantic search indexing for repo: ${repoId}`);

  // 1. Fetch Repository Details
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { user: true },
  });

  if (!repo) throw new Error("Repo not found");

  const [owner, name] = repo.full_name.split('/');
  const accessToken = repo.user.github_access_token;

  if (!accessToken) throw new Error("No github access token found for user");

  const octokit = new Octokit({ auth: accessToken });

  // 2. Clear old index for this repo to do a clean sync (in a real app we'd do incremental)
  await prisma.document.deleteMany({
    where: { repo_id: repoId },
  });

  // 3. Index Repository Metadata
  await indexRepositoryMetadata(repoId, repo.name, repo.full_name);

  // 4. Fetch and Index Source Files (Default Branch)
  try {
    const branch = repo.default_branch || 'main';
    const tree = await octokit.rest.git.getTree({
      owner,
      repo: name,
      tree_sha: branch,
      recursive: '1'
    });

    const files = tree.data.tree.filter(t => t.type === 'blob' && isCodeFile(t.path || ''));

    console.log(`Found ${files.length} code files to index for ${repo.full_name}`);

    // Process files in small batches to respect rate limits
    for (let i = 0; i < Math.min(files.length, 50); i++) { // Limit to 50 files for Demo purposes
      const file = files[i];
      if (!file.path || !file.sha) continue;
      
      try {
        const fileData = await octokit.rest.git.getBlob({
          owner,
          repo: name,
          file_sha: file.sha
        });
        
        const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
        await indexFileContent(repoId, file.path, content);
      } catch (err) {
        console.warn(`Failed to index file ${file.path}`, err);
      }
    }
  } catch (err) {
    console.error("Error fetching repository tree:", err);
  }

  console.log(`Finished semantic search indexing for repo: ${repoId}`);
}

async function indexRepositoryMetadata(repoId: string, name: string, fullName: string) {
  const content = `Repository: ${fullName}\nThis is the root repository object.`;
  const embedding = await generateEmbedding(content);
  
  await storeDocument({
    repo_id: repoId,
    type: 'repository',
    title: name,
    content,
    path: '/',
    embedding,
  });
}

async function indexFileContent(repoId: string, path: string, content: string) {
  // Simple chunking strategy
  const chunks = [];
  let currentChunk = '';
  const lines = content.split('\n');

  for (const line of lines) {
    if (currentChunk.length + line.length > CHUNK_SIZE) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += line + '\n';
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk);

  for (let i = 0; i < chunks.length; i++) {
    const chunkContent = chunks[i];
    const embedding = await generateEmbedding(chunkContent);
    
    await storeDocument({
      repo_id: repoId,
      type: 'code_chunk',
      title: `${path} (Part ${i + 1})`,
      content: chunkContent,
      path,
      metadata: { chunkIndex: i },
      embedding,
    });
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: isOrKey ? 'openai/text-embedding-3-small' : 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '),
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

async function storeDocument(data: any) {
  const { repo_id, type, title, content, path, metadata, embedding } = data;
  
  // Create document without embedding first
  const doc = await prisma.document.create({
    data: {
      repo_id,
      type,
      title,
      content,
      path,
      metadata,
    }
  });

  // Update with pgvector syntax using raw SQL
  if (embedding && embedding.length > 0) {
    const vectorString = `[${embedding.join(',')}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE documents SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      doc.id
    );
  }
}

function isCodeFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase();
  const validExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'md', 'json', 'yml', 'yaml', 'html', 'css', 'scss', 'prisma'];
  return validExts.includes(ext || '') && !path.includes('node_modules') && !path.includes('.git');
}
