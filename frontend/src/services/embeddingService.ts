import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API;
const isOrKey = apiKey?.startsWith('sk-or');

const openai = new OpenAI({
  apiKey,
  baseURL: isOrKey ? 'https://openrouter.ai/api/v1' : undefined,
});

export class EmbeddingService {
  /**
   * Generate an embedding for the given text using text-embedding-3-small
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: isOrKey ? 'openai/text-embedding-3-small' : 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '), // Openai recommends removing newlines for some models, though less needed for 3
        dimensions: 1536,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for a batch of texts
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: isOrKey ? 'openai/text-embedding-3-small' : 'text-embedding-3-small',
        input: texts.map(t => t.replace(/\n/g, ' ')),
        dimensions: 1536,
      });

      // Sort just in case the API returns them out of order (usually doesn't)
      return response.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw error;
    }
  }
}
