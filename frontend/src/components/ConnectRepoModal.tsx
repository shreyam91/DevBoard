"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FolderGit2, Star, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function ConnectRepoModal({ isOpen, onClose, onConnected }: ConnectRepoModalProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [connectingId, setConnectingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRepos();
    }
  }, [isOpen]);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) throw new Error("Failed to fetch repos");
      const data = await res.json();
      if (data.repos) {
        setRepos(data.repos);
      }
    } catch (error) {
      toast.error("Failed to load GitHub repositories.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (repo: Repo) => {
    setConnectingId(repo.id);
    try {
      const res = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_repo_id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect repository");
      }
      
      toast.success("Repository connected!");
      if (onConnected) onConnected();
      
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConnectingId(null);
    }
  };

  const filteredRepos = repos.filter((r) => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Connect Repository</h2>
                <p className="text-[13px] text-slate-500 mt-1">Select a GitHub repository to track architectural decisions.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-3 text-accent-blue" />
                  <p className="text-[13px] font-medium">Fetching repositories...</p>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FolderGit2 className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-[13px] font-medium">No repositories found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-2">
                  {filteredRepos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <FolderGit2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-slate-900">{repo.full_name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500 font-medium">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5" />
                              {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleConnect(repo)}
                        disabled={connectingId !== null}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {connectingId === repo.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
