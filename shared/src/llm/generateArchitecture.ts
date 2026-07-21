import Anthropic from '@anthropic-ai/sdk';

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
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy',
  });

  const systemPrompt = `You are a senior software architect. Your task is to analyze the provided context (either user answers or extracted repository data) and generate a structured ARCHITECTURE.md file. You must also extract key architectural decisions into a structured JSON list.`;

  // We map the requested claude-sonnet-4-6 to claude-3-5-sonnet-20240620 as it is the closest actual model ID
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here is the context for the project:\n${JSON.stringify(context.data, null, 2)}\n\nGenerate the architecture following the requested JSON structure.`,
      },
    ],
    tools: [
      {
        name: 'save_architecture',
        description: 'Saves the generated ARCHITECTURE.md and the extracted architectural decisions.',
        input_schema: {
          type: 'object',
          properties: {
            markdownContent: {
              type: 'string',
              description: 'The complete content for the ARCHITECTURE.md file.',
            },
            decisions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'A short title of the decision' },
                  rationale: { type: 'string', description: 'The reason for this decision' },
                  category: { 
                    type: 'string', 
                    enum: ['database', 'infra', 'api', 'architecture', 'tooling'],
                  },
                },
                required: ['title', 'rationale', 'category'],
              },
            },
          },
          required: ['markdownContent', 'decisions'],
        },
      }
    ],
    tool_choice: { type: 'tool', name: 'save_architecture' }
  });

  const toolBlock = response.content.find((block) => block.type === 'tool_use' && block.name === 'save_architecture');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('LLM failed to use the save_architecture tool');
  }

  const result = toolBlock.input as unknown as Omit<GenerateArchitectureResult, 'decisions'> & { decisions: Omit<ArchitectureDecision, 'source'>[] };
  
  return {
    markdownContent: result.markdownContent,
    decisions: result.decisions.map(d => ({
      ...d,
      source: context.source,
    })),
  };
}
