import { prisma } from './shared/src/prisma';
async function main() {
  const vector = [0.1, 0.2, 0.3];
  try {
    const jsonString = JSON.stringify(vector);
    await prisma.$executeRaw`SELECT ${jsonString}::vector`;
    console.log("JSON.stringify works");
  } catch(e) {
    console.error("JSON.stringify failed", e);
  }

  try {
    const rawArray = vector;
    await prisma.$executeRaw`SELECT ${rawArray}::vector`;
    console.log("rawArray works");
  } catch(e) {
    console.error("rawArray failed", e);
  }
}
main().finally(() => prisma.$disconnect());
