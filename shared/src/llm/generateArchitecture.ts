import OpenAI from 'openai';

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
  const ai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY,
  });

  const systemPrompt = `You are an elite Staff Software Engineer and Solutions Architect. 
Your task is to analyze the provided context (either user answers or extracted repository data) and generate a highly detailed, professional, and comprehensive ARCHITECTURE.md file. 

The ARCHITECTURE.md should read like a real production-grade engineering document. It MUST include at minimum:
1. **Executive Summary**: High-level overview of the system's purpose and goals.
2. **System Context & Architecture Overview**: High-level component diagram description, including frontend, backend, database, and third-party integrations.
3. **Core Technologies**: Detailed breakdown of the stack with rationale.
4. **Data Flow & Communication**: How data moves through the system (e.g., REST, GraphQL, WebSockets, event queues).
5. **Key Architectural Patterns**: Detailed explanation of patterns used (e.g., Microservices, Monolith, Event-Driven, MVC, Clean Architecture).
6. **Data Storage & Strategy**: Database schemas, caching layers, and storage rationale.
7. **Security & Authentication**: How the system secures data and manages identity.
8. **Scalability & Performance**: Bottlenecks, scaling strategies, and performance considerations.
9. **Deployment & DevOps**: CI/CD pipeline, hosting, and infrastructure overview.

Make the markdown well-structured, easy to read, and highly descriptive. Use markdown tables, lists, and bold text effectively. You must also extract key architectural decisions into the structured JSON list.`;
  const userPrompt = `Here is the context for the project:\n${JSON.stringify(context.data, null, 2)}\n\nGenerate the comprehensive architecture document following the requested JSON structure.`;

  const responseSchema = {
    type: "json_schema",
    json_schema: {
      name: "architecture",
      schema: {
        type: "object",
        properties: {
          markdownContent: {
            type: "string",
            description: 'The complete content for the ARCHITECTURE.md file.',
          },
          decisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: 'A short title of the decision' },
                rationale: { type: "string", description: 'The reason for this decision' },
                category: { 
                  type: "string", 
                  enum: ['database', 'infra', 'api', 'architecture', 'tooling'],
                },
              },
              required: ['title', 'rationale', 'category'],
            },
          },
        },
        required: ['markdownContent', 'decisions'],
        additionalProperties: false
      }
    }
  };

  const response = await ai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: responseSchema as any,
    temperature: 0.2,
  });

  if (!response.choices[0]?.message?.content) {
    throw new Error('LLM failed to generate a response');
  }

  const result = JSON.parse(response.choices[0].message.content) as Omit<GenerateArchitectureResult, 'decisions'> & { decisions: Omit<ArchitectureDecision, 'source'>[] };
  
  return {
    markdownContent: result.markdownContent,
    decisions: result.decisions.map(d => ({
      ...d,
      source: context.source,
    })),
  };
}
