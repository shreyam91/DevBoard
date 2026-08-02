import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';
import OpenAI from 'openai';

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;
    const body = await req.json();
    const { answers } = body;

    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: userId }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const ai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY,
    });

    const systemPrompt = `You are an elite Software Architect interviewing an engineer about their new project. 
They have provided some basic answers about their tech stack and goals. 
Your job is to generate exactly 2 highly specific, deeply technical follow-up questions to uncover details about their domain model, data flow, or specific architectural challenges. 
DO NOT ask about their tech stack again (e.g. don't ask why they chose Next.js). Ask about the BUSINESS logic or specific structural implementation.
Respond ONLY with a JSON array of objects, where each object has an "id" (string), "title" (string, the question), and "placeholder" (string, example answer format).`;

    const userPrompt = `Project Name: ${repo.full_name}\nInitial Answers:\n${JSON.stringify(answers, null, 2)}`;

    const responseSchema = {
      type: "json_schema",
      json_schema: {
        name: "interview_questions",
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              placeholder: { type: "string" }
            },
            required: ["id", "title", "placeholder"],
            additionalProperties: false
          }
        }
      }
    };

    const response = await ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: responseSchema as any,
      temperature: 0.7,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }

    const questions = JSON.parse(content);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating AI interview questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
