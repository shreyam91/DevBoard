import { prisma } from '../shared/src/prisma';

async function main() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  console.log('Deleted all sessions and accounts. User will need to re-login.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
