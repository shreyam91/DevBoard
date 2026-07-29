import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';

export const maxDuration = 60; // Allow more time for this function

interface GraphNode {
  id: string;
  label: string;
  type: string;
  metadata?: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;

    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: session.user.id }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const analysis = await prisma.architectureAnalysis.findFirst({
      where: { repo_id: repoId },
      orderBy: { analyzed_at: 'desc' }
    });

    if (!analysis) {
      return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error fetching architecture analysis:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;
    
    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: session.user.id }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    if (!dbAccount?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const token = dbAccount.access_token;
    const [owner, name] = repo.full_name.split('/');
    const branch = repo.default_branch || 'main';

    // 1. Fetch the git tree
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${branch}?recursive=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!treeRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch repository tree' }, { status: treeRes.status });
    }

    const treeData = await treeRes.json();
    if (!treeData.tree || treeData.tree.length === 0) {
      return NextResponse.json({ error: 'Empty repository or invalid tree' }, { status: 400 });
    }

    const allFiles = treeData.tree.filter((t: any) => t.type === 'blob');
    
    // Filter to code files only for dependency parsing
    const codeFiles = allFiles.filter((t: any) => 
      t.path.endsWith('.ts') || 
      t.path.endsWith('.tsx') || 
      t.path.endsWith('.js') || 
      t.path.endsWith('.jsx')
    );

    // Limit to 60 files to avoid hitting API rate limits during this demo
    const filesToAnalyze = codeFiles.slice(0, 60);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const stats = {
      modules: 0,
      components: 0,
      services: 0,
      controllers: 0,
      apis: 0,
      models: 0,
      total_files: allFiles.length,
      analyzed_files: filesToAnalyze.length
    };

    // Directory structure nodes removed to focus purely on file dependencies

    // We will parse imports for the code files
    // This is a naive regex parser for dependencies
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
    const requireRegex = /require\(['"](.*?)['"]\)/g;

    const fileContents = await Promise.all(
      filesToAnalyze.map(async (file: any) => {
        try {
          const res = await fetch(file.url, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3.raw'
            }
          });
          if (!res.ok) return { path: file.path, content: '' };
          const content = await res.text();
          return { path: file.path, content };
        } catch {
          return { path: file.path, content: '' };
        }
      })
    );

    for (const file of fileContents) {
      if (!file.content) continue;

      let type = 'file';
      const pathLower = file.path.toLowerCase();
      
      if (pathLower.includes('controller')) { type = 'controller'; stats.controllers++; }
      else if (pathLower.includes('service')) { type = 'service'; stats.services++; }
      else if (pathLower.includes('api') || pathLower.includes('route')) { type = 'api'; stats.apis++; }
      else if (pathLower.includes('model') || pathLower.includes('schema') || pathLower.includes('prisma')) { type = 'model'; stats.models++; }
      else if (pathLower.includes('component') || pathLower.endsWith('.tsx') || pathLower.endsWith('.jsx')) { type = 'component'; stats.components++; }
      else { type = 'module'; stats.modules++; }

      const parts = file.path.split('/');
      const fileName = parts.length > 1 && ['page.tsx', 'layout.tsx', 'route.ts'].includes(parts[parts.length - 1]) 
        ? parts.slice(-2).join('/') 
        : parts[parts.length - 1] || file.path;

      nodes.push({
        id: file.path,
        label: fileName,
        type: type === 'model' ? 'databaseSchema' : 'custom',
        metadata: { path: file.path, nodeType: type }
      });

      // Extract dependencies
      const dependencies = new Set<string>();
      
      let match;
      while ((match = importRegex.exec(file.content)) !== null) {
        dependencies.add(match[1]);
      }
      while ((match = requireRegex.exec(file.content)) !== null) {
        dependencies.add(match[1]);
      }

      dependencies.forEach(dep => {
        // Very basic resolution - if the import is relative, we try to construct the path
        // For simplicity in this demo, we just create the edge to the raw import string if we can't resolve it perfectly
        let targetId = dep;
        
        if (dep.startsWith('.')) {
          const dir = file.path.split('/').slice(0, -1).join('/');
          // Basic normalisation (e.g., ./utils -> folder/utils)
          targetId = dir ? `${dir}/${dep.replace('./', '')}` : dep.replace('./', '');
          
          // Strip extensions and look for a matching node
          targetId = targetId.replace(/\.(ts|js|tsx|jsx)$/, '');
        }

        // We only add edges for dependencies we tracked as nodes, or external packages
        const isInternal = dep.startsWith('.');
        const targetNodeExists = nodes.some(n => n.id.startsWith(targetId) || n.id === targetId);

        if (isInternal && !targetNodeExists) return; // Skip internal edges we couldn't resolve
        
        if (!isInternal && !nodes.some(n => n.id === dep)) {
          // Add external package node
          nodes.push({
            id: dep,
            label: dep,
            type: 'package'
          });
        }

        const targetNode = nodes.find(n => n.id.startsWith(targetId) || n.id === targetId);
        
        let edgeType = 'smoothstep';
        let edgeData = {};
        
        if (targetNode) {
          if (targetNode.type === 'databaseSchema') {
            edgeType = 'data-edge';
            edgeData = { label: 'QUERY' };
          } else if (targetNode.metadata?.nodeType === 'api' || type === 'api') {
            edgeType = 'animated-svg-edge';
          } else if (targetNode.metadata?.nodeType === 'component' && type === 'component') {
            edgeType = 'button-edge';
          }
        } else if (!isInternal) {
          edgeType = 'button-edge';
        }

        edges.push({
          id: `${file.path}-${dep}`,
          source: file.path,
          target: targetNode ? targetNode.id : dep,
          relationship: 'imports',
          type: edgeType,
          data: edgeData
        });
      });
    }

    const graphData = { nodes, edges };

    const analysis = await prisma.architectureAnalysis.create({
      data: {
        repo_id: repoId,
        version_hash: treeData.sha,
        graph_data: graphData,
        stats
      }
    });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing repository:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
