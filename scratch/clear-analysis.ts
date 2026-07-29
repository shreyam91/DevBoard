import { PrismaClient } from '@prisma/client';
import { prisma } from '../shared/src/prisma';

async function main() {
  const result = await prisma.architectureAnalysis.deleteMany({});
  console.log(`Deleted ${result.count} architecture analyses.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
