"use client";

import { motion } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Code2, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

const ENDPOINTS = [
  { id: "authentication", title: "Authentication" },
  { id: "repositories", title: "Repositories" },
  { id: "decisions", title: "Architecture Decisions" },
  { id: "conflicts", title: "Conflicts" },
  { id: "webhooks", title: "Webhooks" },
];

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string>("authentication");

  const scrollTo = (id: string) => {
    setActiveEndpoint(id);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 py-20 md:px-12 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-[250px_1fr] gap-16 items-start">
        
        {/* Left: Sticky Navigation */}
        <aside className="hidden md:flex flex-col sticky top-32">
          <div className="text-[12px] font-bold tracking-widest text-slate-400 uppercase mb-6">API Reference</div>
          <nav className="flex flex-col gap-3 border-l-2 border-slate-100 pl-4">
            {ENDPOINTS.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => scrollTo(endpoint.id)}
                className={cn(
                  "text-left text-[14px] font-medium transition-colors hover:text-slate-900",
                  activeEndpoint === endpoint.id ? "text-accent-blue" : "text-slate-500"
                )}
              >
                {endpoint.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: API Content */}
        <div className="flex flex-col">
          
          <div className="mb-16 border-b border-slate-200 pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-8 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-accent-blue" />
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Developers</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[40px] md:text-[56px] font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]"
            >
              API Documentation
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed"
            >
              Integrate DevBoard's architectural intelligence directly into your CI/CD pipelines, custom dashboards, or internal developer portals.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-24"
          >
            <section id="authentication" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold text-slate-900 mb-4">Authentication</h2>
              <p className="text-[15px] text-slate-600 mb-8 leading-relaxed">
                All API requests require a Bearer token. You can generate a personal access token in your DevBoard dashboard settings.
              </p>
              
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <Terminal className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-[13px] text-slate-300 font-mono">cURL Example</span>
                </div>
                <div className="p-6 overflow-x-auto text-[14px] text-slate-300 font-mono leading-relaxed">
                  <span className="text-pink-400">curl</span> -H <span className="text-green-300">"Authorization: Bearer db_123456789"</span> \
                  <br/>
                  &nbsp;&nbsp;https://api.devboard.io/v1/user
                </div>
              </div>
            </section>

            <section id="repositories" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold text-slate-900 mb-4">List Repositories</h2>
              <p className="text-[15px] text-slate-600 mb-8 leading-relaxed">
                Retrieve a list of all repositories currently tracked by DevBoard under your organization.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider mb-4">Endpoint</h3>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-mono text-[12px] font-bold rounded">GET</span>
                    <span className="font-mono text-[14px] text-slate-700">/v1/repos</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider mb-4">Response</h3>
                  <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-[13px] text-slate-300 font-mono leading-relaxed border border-slate-800">
                    <span className="text-slate-400">{"{"}</span><br/>
                    &nbsp;&nbsp;<span className="text-blue-300">"data"</span>: <span className="text-slate-400">[</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-400">{"{"}</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"id"</span>: <span className="text-green-300">"repo_9f8e7d"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"name"</span>: <span className="text-green-300">"api-gateway"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"decisions_count"</span>: <span className="text-orange-300">42</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-400">{"}"}</span><br/>
                    &nbsp;&nbsp;<span className="text-slate-400">]</span><br/>
                    <span className="text-slate-400">{"}"}</span>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="decisions" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold text-slate-900 mb-4">Fetch Decisions</h2>
              <p className="text-[15px] text-slate-600 mb-8 leading-relaxed">
                Retrieve all architectural decisions documented within a specific repository.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider mb-4">Endpoint</h3>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-mono text-[12px] font-bold rounded">GET</span>
                    <span className="font-mono text-[14px] text-slate-700">/v1/repos/:id/decisions</span>
                  </div>
                </div>
              </div>
            </section>

          </motion.div>
        </div>

      </main>
      
      <div className="relative z-10">
        <MarketingFooter />
      </div>
    </div>
  );
}
