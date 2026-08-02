import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from './shared/src/prisma';

async function main() {
  const users = await clerkClient().users.getUserList();
  console.log("Clerk Users:");
  users.data.forEach((u: any) => console.log(u.id, u.emailAddresses[0]?.emailAddress));

  const clerkUserId = users.data[0]?.id;

  if (!clerkUserId) {
    console.log("No Clerk user found!");
    return;
  }

  const repos = await prisma.repo.findMany();
  console.log("\nRepos in DB before update:");
  repos.forEach((r: any) => console.log(r.id, r.user_id, r.full_name));

  for (const repo of repos) {
    if (repo.user_id !== clerkUserId) {
      await prisma.repo.update({
        where: { id: repo.id },
        data: { user_id: clerkUserId }
      });
      console.log(`Updated repo ${repo.full_name} to use Clerk user ID ${clerkUserId}`);
    }
  }
}
main().catch(console.error);
