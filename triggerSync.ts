import { repoSyncQueue } from './shared/src/queue';

async function main() {
  await repoSyncQueue.add('repo-sync', {});
  console.log('Triggered manual repo sync job');
  process.exit(0);
}

main().catch(console.error);
