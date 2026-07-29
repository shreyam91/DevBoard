import Link from "next/link";
import { FolderGit2, Settings, LogOut, ArrowRight } from "lucide-react";
import { auth, signOut } from "@/auth";
import { prisma } from "@devboard/shared/src/prisma";
import { ConnectButton } from "@/components/ConnectButton";
import { redirect } from "next/navigation";
import RepoGridClient from "./RepoGridClient";

export default async function DashboardRootPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const repos = await prisma.repo.findMany({
    where: { user_id: session.user.id },
    orderBy: { connected_at: 'desc' }
  });
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-accent-blue/20">
      {/* Topbar */}
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-[28px] h-[28px] bg-accent-blue rounded flex items-center justify-center shrink-0">
            <i className="ti ti-topology-star-3 text-white text-[16px]"></i>
          </div>
          <span className="text-[15px] font-semibold text-slate-900">DevBoard</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Documentation</Link>
          <div className="w-px h-4 bg-slate-200"></div>
          <button className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button type="submit" className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-accent-red transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Repositories</h1>
            <p className="text-[14px] text-slate-500 mt-1">Select a repository to view its architectural decisions.</p>
          </div>
          <ConnectButton />
        </div>

        {/* Repo Grid */}
        <RepoGridClient initialRepos={repos} />
      </main>
    </div>
  );
}
