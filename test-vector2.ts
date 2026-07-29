import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();
async function main() {
  const vector = [0.1, 0.2, 0.3];
  
  try {
    const embeddingString = `[${vector.join(',')}]`;
    const res = await prisma.$queryRaw`SELECT ${embeddingString}::vector`;
    console.log("Stringify works:", res);
  } catch(e) {
    console.error("Stringify failed", e);
  }

  try {
    const rawArray = vector;
    const res = await prisma.$queryRaw`SELECT ${rawArray}::vector`;
    console.log("rawArray works:", res);
  } catch(e) {
    console.error("rawArray failed", e);
  }
}
main().finally(() => prisma.$disconnect());
