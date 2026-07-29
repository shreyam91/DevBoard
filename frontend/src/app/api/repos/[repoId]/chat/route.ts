import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { EmbeddingService } from '@/services/embeddingService';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API;
const isOrKey = apiKey?.startsWith('sk-or');
const openai = new OpenAI({ 
  apiKey,
  baseURL: isOrKey ? 'https://openrouter.ai/api/v1' : undefined
});

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { message } = await req.json();
    const { repoId } = params;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Generate Embedding for user's question
    const queryEmbedding = await EmbeddingService.generateEmbedding(message);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // 2. Fetch relevant context from DB
    const results: any[] = await prisma.$queryRawUnsafe(`
      SELECT title, content, path, 1 - (embedding <=> $1::vector) as similarity
      FROM documents
      WHERE repo_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT 10
    `, vectorString, repoId);

    // 3. Format Context
    const context = results
      .map(doc => `--- FILE: ${doc.path || doc.title} ---\n${doc.content}\n`)
      .join('\n');

    // 4. Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: isOrKey ? 'openai/gpt-4o' : 'gpt-4o', // or gpt-3.5-turbo if 4o isn't available
      messages: [
        {
          role: 'system',
          content: `You are an expert Senior Software Engineer AI assistant helping a developer understand their codebase.
Use the following retrieved files and code snippets from their repository to answer the user's question.
If the answer is not in the context, you can infer based on general knowledge but explicitly state that you are guessing since it's not in the retrieved context.
Always cite your sources by mentioning the file path or title.

CONTEXT:
${context}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      answer: completion.choices[0].message.content,
      sources: results.map(r => ({ path: r.path, title: r.title, similarity: r.similarity }))
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
