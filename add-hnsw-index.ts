import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Applying HNSW index...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS documents_embedding_idx 
    ON documents 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
  `);
  console.log("HNSW index applied.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
