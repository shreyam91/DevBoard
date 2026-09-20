/**
 * Ask DevHub chat service.
 *
 * Given a user question + repoId, this module:
 *   1. Loads or creates a ChatSession.
 *   2. Retrieves + reranks context from the RAG knowledge base.
 *   3. Builds the grounded prompt (with conversation history).
 *   4. Calls the LLM.
 *   5. Reconciles citations into clickable Source links.
 *   6. Persists both messages and returns the answer + sources.
 *
 * The chat service never answers from outside the retrieved context.
 * Repository isolation is enforced by the retrieval module, which always
 * prefixes the pgvector query with `WHERE repo_id = $X`.
 */

import { prisma } from '../prisma';
import { getLLMClient, REVIEW_MODEL } from '../llm/client';
import { retrieve, retrieveFallback } from '../rag/retrieval/query';
import { extractMetadataFilters, contextToFilter, type MetadataFilter } from '../rag/retrieval/filters';
import { rerank } from '../rag/reranking/rerank';
import { buildPrompt, reconcileSources, buildSources, REFUSAL_PHRASE, type ChatTurn } from '../rag/contextBuilder/buildPrompt';
import type { Citation, RerankedChunk } from '../rag/types';

// Maximum number of history turns to include in the prompt.
const MAX_HISTORY = 8;

export interface AskDevHubAnswer {
  answer: string;
  sources: Citation[];
  sessionId: string;
  emptyContext: boolean;
}

/**
 * Main entry point for Ask DevHub.
 */
export async function askDevHub({
  repoId,
  question,
  sessionId,
  context,
}: {
  repoId: string;
  question: string;
  sessionId?: string;
  context?: { prNumber?: number; issueNumber?: number; adrId?: string; filePath?: string; documentType?: string };
}): Promise<AskDevHubAnswer> {
  // 1. Load or create session.
  let session;
  if (sessionId) {
    session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.repo_id !== repoId) {
      throw new Error('Invalid session');
    }
  } else {
    session = await prisma.chatSession.create({
      data: { repo_id: repoId, user_id: '', title: question.slice(0, 120) },
    });
  }

  // 2. Persist user message immediately.
  await prisma.chatMessage.create({
    data: {
      session_id: session.id,
      role: 'user',
      content: question,
      context: context ? JSON.parse(JSON.stringify(context)) : undefined,
    },
  });

  // 3. Load conversation history.
  const rawHistory = await prisma.chatMessage.findMany({
    where: { session_id: session.id },
    orderBy: { created_at: 'asc' },
    select: { role: true, content: true },
  });
  const history: ChatTurn[] = rawHistory.slice(-MAX_HISTORY).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // 4. Build metadata filters from question + optional context.
  const filters: MetadataFilter[] = extractMetadataFilters(question);
  const ctxFilter = context ? contextToFilter(context) : null;
  if (ctxFilter) filters.unshift(ctxFilter);

  // 5. Retrieve + rerank.
  let candidates = await retrieve({ repoId, question, filters, limit: 30 });
  let emptyContext = false;

  if (candidates.length < 3) {
    // Very few vector hits — pull a broader fallback set to give the model something to work with.
    const fallback = await retrieveFallback(repoId);
    candidates = [...candidates, ...fallback];
    if (candidates.length === 0) emptyContext = true;
  }

  const ranked = rerank(candidates, question, filters);

  // 6. Build prompt and call LLM.
  const { system, user, sources } = buildPrompt({ question, contextChunks: ranked, history });

  const llm = getLLMClient();
  const rawAnswer = await llm.chat.completions.create({
    model: REVIEW_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  });

  const content = rawAnswer.choices[0]?.message?.content ?? REFUSAL_PHRASE;
  const { text: reconciledAnswer, citedIndices } = reconcileSources(content);
  const finalSources = buildSources(sources, citedIndices);

  // 7. Persist assistant message with sources.
  await prisma.chatMessage.create({
    data: {
      session_id: session.id,
      role: 'assistant',
      content: reconciledAnswer,
      sources: JSON.parse(JSON.stringify(finalSources)),
      context: ranked.length > 0
        ? JSON.parse(JSON.stringify({
            docsRetrieved: ranked.length,
            emptyContext,
            topScore: ranked[0]?.score,
            sourceTypes: Array.from(new Set(ranked.map((c) => c.metadata.sourceType))),
          }))
        : undefined,
    },
  });

  // 8. Update session title and timestamp.
  await prisma.chatSession.update({
    where: { id: session.id },
    data: { updated_at: new Date() },
  });

  return {
    answer: reconciledAnswer,
    sources: finalSources,
    sessionId: session.id,
    emptyContext,
  };
}

/**
 * List chat sessions for a repository, newest first.
 */
export async function listSessions(repoId: string) {
  return prisma.chatSession.findMany({
    where: { repo_id: repoId },
    orderBy: { updated_at: 'desc' },
    select: {
      id: true,
      title: true,
      created_at: true,
      updated_at: true,
      _count: { select: { messages: true } },
    },
  });
}

/**
 * Load all messages in a session.
 */
export async function getMessages(sessionId: string) {
  return prisma.chatMessage.findMany({
    where: { session_id: sessionId },
    orderBy: { created_at: 'asc' },
    select: { id: true, role: true, content: true, sources: true, context: true, created_at: true },
  });
}

/**
 * Delete a chat session and all its messages.
 */
export async function deleteSession(sessionId: string) {
  await prisma.chatSession.delete({ where: { id: sessionId } });
}