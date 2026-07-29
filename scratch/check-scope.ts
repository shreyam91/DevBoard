import { prisma } from '../shared/src/prisma';

async function main() {
  const account = await prisma.account.findFirst({
    where: { provider: 'github' }
  });
  console.log('Account access_token:', account?.access_token?.substring(0, 10) + '...');
  console.log('Account scope:', account?.scope);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
