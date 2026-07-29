import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: './frontend/.env' });

const apiKey = process.env.OPEN_AI_API;
const openai = new OpenAI({
  apiKey,
  baseURL: apiKey?.startsWith('sk-or') ? 'https://openrouter.ai/api/v1' : undefined,
});

async function run() {
  try {
    const response = await openai.embeddings.create({
      model: 'openai/text-embedding-3-small',
      input: 'hello world',
    });
    console.log("Success!", response);
  } catch(e) {
    console.error("Error", e);
  }
}
run();
