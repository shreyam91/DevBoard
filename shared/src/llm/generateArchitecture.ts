import { GoogleGenAI, Type, Schema } from '@google/genai';

export type ArchitectureContext = {
  source: 'questionnaire' | 'archaeology';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type ArchitectureDecision = {
  title: string;
  rationale: string;
  category: 'database' | 'infra' | 'api' | 'architecture' | 'tooling';
  source: 'questionnaire' | 'archaeology';
};

export type GenerateArchitectureResult = {
  markdownContent: string;
  decisions: ArchitectureDecision[];
};

export async function generateArchitecture(context: ArchitectureContext): Promise<GenerateArchitectureResult> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy',
  });

  const systemPrompt = `You are a senior software architect. Your task is to analyze the provided context (either user answers or extracted repository data) and generate a structured ARCHITECTURE.md file. You must also extract key architectural decisions into a structured JSON list.`;
  const userPrompt = `Here is the context for the project:\n${JSON.stringify(context.data, null, 2)}\n\nGenerate the architecture following the requested JSON structure.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      markdownContent: {
        type: Type.STRING,
        description: 'The complete content for the ARCHITECTURE.md file.',
      },
      decisions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'A short title of the decision' },
            rationale: { type: Type.STRING, description: 'The reason for this decision' },
            category: { 
              type: Type.STRING, 
              enum: ['database', 'infra', 'api', 'architecture', 'tooling'],
            },
          },
          required: ['title', 'rationale', 'category'],
        },
      },
    },
    required: ['markdownContent', 'decisions'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.2,
    },
  });

  if (!response.text) {
    throw new Error('LLM failed to generate a response');
  }

  const result = JSON.parse(response.text) as Omit<GenerateArchitectureResult, 'decisions'> & { decisions: Omit<ArchitectureDecision, 'source'>[] };
  
  return {
    markdownContent: result.markdownContent,
    decisions: result.decisions.map(d => ({
      ...d,
      source: context.source,
    })),
  };
}
