import Link from "next/link";
import { FolderGit2, Plus, Settings, LogOut } from "lucide-react";

const MOCK_REPOS = [
  { id: "devboard-frontend", name: "devboard-frontend", description: "Next.js frontend for the DevBoard platform.", updated: "2 hours ago" },
  { id: "api-gateway", name: "api-gateway", description: "Rust-based API gateway and reverse proxy.", updated: "1 day ago" },
  { id: "auth-service", name: "auth-service", description: "Authentication microservice using OAuth2.", updated: "3 days ago" }
];

export default function DashboardRootPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-accent-blue/20">
      {/* Topbar */}
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-[28px] h-[28px] bg-accent-blue rounded flex items-center justify-center shrink-0">
            <i className="ti ti-topology-star-3 text-white text-[16px]"></i>
          </div>
          <span className="text-[15px] font-semibold text-slate-900">DevBoard</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Documentation</Link>
          <div className="w-px h-4 bg-slate-200"></div>
          <button className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-accent-red transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Repositories</h1>
            <p className="text-[14px] text-slate-500 mt-1">Select a repository to view its architectural decisions.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Connect Repository
          </button>
        </div>

        {/* Warning Banner for Auth Bypass */}
        <div className="mb-8 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-xl flex items-start gap-3">
          <div className="text-accent-blue mt-0.5">
            <i className="ti ti-info-circle text-[18px]"></i>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-accent-blue mb-1">Development Mode Active</h3>
            <p className="text-[13px] text-accent-blue/80">
              Authentication is currently disabled. These are mock repositories. Clicking on them will route you to the dashboard layout which has its authentication checks disabled.
            </p>
          </div>
        </div>

        {/* Repo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_REPOS.map((repo) => (
            <Link 
              key={repo.id} 
              href={`/dashboard/${repo.id}`}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all flex flex-col h-[180px]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-accent-blue group-hover:bg-accent-blue/5 transition-colors">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h2 className="text-[16px] font-semibold text-slate-900">{repo.name}</h2>
              </div>
              
              <p className="text-[13px] text-slate-500 line-clamp-2 mb-auto leading-relaxed">
                {repo.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <span className="text-[11px] font-medium text-slate-400">Updated {repo.updated}</span>
                <span className="text-[11px] font-bold text-accent-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  View Architecture &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
