import { auth } from "@clerk/nextjs/server";
import { prisma } from "@devboard/shared/src/prisma";
import { redirect } from "next/navigation";
import { GitFork, GitCommit, Boxes } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui/primitives";
import { ConnectButton } from "@/components/ConnectButton";
import RepoGridClient from "./RepoGridClient";

export default async function DashboardRootPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const repos = await prisma.repo.findMany({
    where: { user_id: userId },
    orderBy: { connected_at: 'desc' }
  });

  const totalCommits = repos.reduce((s, r) => s + (r.commit_count ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Connected repositories"
        description="Every GitHub repository synced with DevHub. Open one to review its architecture, decisions, and detected conflicts."
        actions={<ConnectButton />}
      />

      {/* Real-data stat band */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Repositories" value={String(repos.length)} icon={<GitFork className="h-4 w-4" />} tone="muted" hint="synced with DevHub" />
        <StatCard label="Commits tracked" value={totalCommits.toLocaleString()} icon={<GitCommit className="h-4 w-4" />} tone="ok" hint="across connected repos" />
        <StatCard label="Architecture" value="Live" icon={<Boxes className="h-4 w-4" />} tone="muted" hint="reconstructed per repository" />
      </div>

      {/* Repo grid (live SSE updates preserved) */}
      <RepoGridClient initialRepos={repos} />
    </div>
  );
}