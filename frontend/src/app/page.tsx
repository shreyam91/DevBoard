"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  // Since we don't have auth on the client directly in the same way, we can assume false or fetch it if needed.
  // For the landing page UI, we'll just show the generic logged-out state per the design requirements.
  const isSignedIn = false;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <MarketingNavbar isSignedIn={isSignedIn} />

      <main className="overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center px-6 pt-32 pb-24 text-center md:px-8 lg:pt-40 lg:pb-32">
          {/* Background Gradient */}
          <div className="absolute top-[-20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 opacity-20 blur-[120px] bg-gradient-to-b from-primary to-primary-light pointer-events-none rounded-full" />
          
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="relative z-10 flex flex-col items-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
              <i className="ti ti-sparkles text-[14px] text-primary-light"></i>
              <span className="text-[13px] font-medium text-primary-light">AI-Powered Architecture Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-tight">
              Never Lose an <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5551ff] to-[#9591ff]">Architecture Decision</span> Again.
            </motion.h1>

            <motion.p variants={fadeIn} className="max-w-2xl text-[16px] md:text-[18px] leading-relaxed text-white/60 mb-10">
              Every repository contains hundreds of architectural decisions hidden inside commits, pull requests, and code reviews. DevBoard automatically reconstructs, documents, and protects those decisions so your architecture never drifts.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/login" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(85,81,255,0.3)]">
                <i className="ti ti-brand-github text-lg"></i>
                Connect GitHub
              </Link>
              <Link href="#preview" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover text-white/80 transition-colors backdrop-blur-md">
                <i className="ti ti-player-play text-lg"></i>
                See Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Illustration Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 w-full max-w-6xl mt-24"
            id="preview"
          >
            <div className="relative rounded-2xl border border-surface-border bg-[#0B0F19]/50 backdrop-blur-xl shadow-2xl overflow-hidden animate-float">
              {/* Browser Chrome */}
              <div className="flex items-center px-4 h-12 border-b border-surface-border bg-surface">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="mx-auto flex h-7 items-center justify-center rounded-md bg-white/5 px-4 text-[12px] text-white/40">
                  <i className="ti ti-lock mr-2 text-[10px]"></i>
                  app.devboard.io
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="flex h-[500px]">
                {/* Sidebar */}
                <div className="w-64 border-r border-surface-border p-4 hidden md:block bg-surface/30">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                      <i className="ti ti-brand-github text-white text-[14px]"></i>
                    </div>
                    <span className="font-medium text-[14px]">acme/api-core</span>
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-[13px] text-white/40 font-medium uppercase tracking-wider mb-2">Project</div>
                    <div className="px-3 py-2 rounded-md bg-primary/10 text-primary-light font-medium text-[14px] flex items-center gap-2">
                      <i className="ti ti-timeline"></i> Timeline
                    </div>
                    <div className="px-3 py-2 rounded-md hover:bg-surface text-white/60 font-medium text-[14px] flex justify-between items-center transition-colors cursor-pointer">
                      <div className="flex items-center gap-2"><i className="ti ti-alert-triangle"></i> Conflicts</div>
                      <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold">1</span>
                    </div>
                    <div className="px-3 py-2 rounded-md hover:bg-surface text-white/60 font-medium text-[14px] flex items-center gap-2 transition-colors cursor-pointer">
                      <i className="ti ti-file-code"></i> Docs
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8 bg-background/40 flex flex-col gap-6 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-surface-border bg-surface">
                      <div className="text-white/50 text-[12px] mb-1">Architecture Status</div>
                      <div className="text-xl font-medium text-green-400 flex items-center gap-2">
                        <i className="ti ti-circle-check-filled"></i> Healthy
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-surface-border bg-surface">
                      <div className="text-white/50 text-[12px] mb-1">Tracked Decisions</div>
                      <div className="text-xl font-medium text-white">142</div>
                    </div>
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                      <div className="text-red-400/80 text-[12px] mb-1">Active Conflicts</div>
                      <div className="text-xl font-medium text-red-400">1</div>
                    </div>
                  </div>

                  <div className="flex gap-6 h-full">
                    {/* Timeline */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="p-5 rounded-xl border border-surface-border bg-surface backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[15px]">Switch to GraphQL for Public API</h4>
                          <span className="text-[12px] text-white/40">2 days ago</span>
                        </div>
                        <p className="text-[13px] text-white/60 line-clamp-2 mb-3">
                          Moving away from REST to GraphQL for the public-facing API to reduce over-fetching and improve mobile client performance.
                        </p>
                        <div className="flex items-center gap-2 text-[12px]">
                          <img src="https://github.com/github.png" alt="Avatar" className="w-5 h-5 rounded-full" />
                          <span className="text-white/80">Merged in PR #842</span>
                        </div>
                      </div>
                      
                      <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                          <span className="text-[10px] uppercase font-bold text-primary-light bg-primary/20 px-2 py-1 rounded">AI Suggestion</span>
                        </div>
                        <div className="flex justify-between items-start mb-2 mt-2">
                          <h4 className="font-medium text-[15px] text-primary-light">Use Redis for Rate Limiting</h4>
                        </div>
                        <p className="text-[13px] text-white/60 mb-3">
                          Detected from PR #845. We are using Redis to implement sliding window rate limiting across all API endpoints.
                        </p>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-primary rounded text-[12px] font-medium text-white">Approve</button>
                          <button className="px-3 py-1.5 bg-surface border border-surface-border rounded text-[12px] font-medium text-white/60">Reject</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Social Proof / Alerts */}
                    <div className="w-72 hidden lg:flex flex-col gap-4">
                      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-red-400 mb-2 font-medium text-[14px]">
                          <i className="ti ti-alert-triangle"></i> Conflict Detected
                        </div>
                        <p className="text-[12px] text-white/70 mb-3">
                          PR #849 introduces `axios` but architecture specifies `fetch` API for all client network requests.
                        </p>
                        <button className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-[12px] font-medium transition-colors">
                          Review PR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="px-6 py-24 md:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col gap-12"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Architecture Decisions Disappear.</h2>
              <p className="text-white/60 text-[16px]">When a project grows, the reasons behind how it was built vanish into the void of old chat logs and closed PRs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div variants={fadeIn} className="p-8 rounded-2xl border border-surface-border bg-surface backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/80">
                  <i className="ti ti-message-2-off text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Knowledge Gets Lost</h3>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  Crucial decisions happen in Slack threads, quick Zoom calls, and PR comments, never making it to official documentation.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="p-8 rounded-2xl border border-surface-border bg-surface backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/80">
                  <i className="ti ti-route-off text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Architecture Drifts</h3>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  Without enforcement, new engineers unknowingly reverse previous decisions, leading to a tangled, inconsistent codebase.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="p-8 rounded-2xl border border-surface-border bg-surface backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white/80">
                  <i className="ti ti-hourglass-empty text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Onboarding Takes Too Long</h3>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  New developers spend weeks reading code just to understand why systems were built a certain way, killing velocity.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="px-6 py-24 md:px-8 bg-surface/30 border-y border-surface-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">DevBoard Works Silently In The Background</h2>
              <p className="text-white/60 text-[16px]">No manual data entry required. We connect to your existing workflows to build your architecture knowledge base automatically.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-2xl border border-surface-border bg-background hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
                    <i className="ti ti-history text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-white">Repo Archaeology</h3>
                </div>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  Connect DevBoard to an existing repository, and our AI scans years of Git history to reconstruct all past architectural decisions automatically.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-surface-border bg-background hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
                    <i className="ti ti-markdown text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-white">AI Generated ARCHITECTURE.md</h3>
                </div>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  DevBoard generates and maintains a living architecture document, opening automated PRs to keep it perfectly in sync with your codebase.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-surface-border bg-background hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <i className="ti ti-git-compare text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-white">PR Conflict Detection</h3>
                </div>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  We monitor every new pull request. If an engineer's code contradicts a previous architectural decision, DevBoard flags it before it merges.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-surface-border bg-background hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <i className="ti ti-bulb text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-white">AI Decision Suggestions</h3>
                </div>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  When Claude recognizes a new pattern or structural change in a merged PR, it suggests adding it to your architecture timeline automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="px-6 py-32 md:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">The automated workflow</h2>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 hidden md:block" />
            
            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
              {[
                { icon: "ti-brand-github", title: "Connect", desc: "Repository" },
                { icon: "ti-scan", title: "Analyze", desc: "Repository" },
                { icon: "ti-file-code", title: "Generate", desc: "Architecture" },
                { icon: "ti-eye", title: "Monitor", desc: "Pull Requests" },
                { icon: "ti-shield-check", title: "Detect", desc: "Conflicts" },
                { icon: "ti-refresh", title: "Update", desc: "Documentation" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-[#0B0F19] border-2 border-surface-border flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative">
                    <i className={`ti ${step.icon} text-2xl text-white/80`}></i>
                    {/* Pulse animation for active step effect */}
                    <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  </div>
                  <h4 className="font-medium text-white text-[15px]">{step.title}</h4>
                  <p className="text-white/40 text-[13px] mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY DEVBOARD (COMPARISON) */}
        <section className="px-6 py-24 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Why DevBoard?</h2>
            <p className="text-white/60 text-[16px]">Built for modern engineering teams who want less busywork and more context.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-surface-border text-white/40 font-medium w-1/4">Feature</th>
                  <th className="p-4 border-b border-surface-border text-white/80 font-medium w-1/4">GitHub</th>
                  <th className="p-4 border-b border-surface-border text-white/80 font-medium w-1/4">Confluence / Notion</th>
                  <th className="p-4 border-b border-primary bg-primary/5 text-primary-light font-semibold w-1/4 rounded-t-xl">DevBoard</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                <tr>
                  <td className="p-4 border-b border-surface-border/50 text-white/60">Stores Code & PRs</td>
                  <td className="p-4 border-b border-surface-border/50 text-green-400"><i className="ti ti-check"></i></td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 bg-primary/5 text-green-400"><i className="ti ti-check"></i></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-surface-border/50 text-white/60">Documentation</td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 text-green-400"><i className="ti ti-check"></i></td>
                  <td className="p-4 border-b border-surface-border/50 bg-primary/5 text-green-400"><i className="ti ti-check"></i></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-surface-border/50 text-white/60">Automatic Updates</td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 bg-primary/5 text-green-400"><i className="ti ti-check"></i></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-surface-border/50 text-white/60">PR Conflict Detection</td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 border-b border-surface-border/50 bg-primary/5 text-green-400"><i className="ti ti-check"></i></td>
                </tr>
                <tr>
                  <td className="p-4 text-white/60">AI Decision Tracking</td>
                  <td className="p-4 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 text-white/20"><i className="ti ti-x"></i></td>
                  <td className="p-4 bg-primary/5 text-green-400 rounded-b-xl"><i className="ti ti-check"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="px-6 py-24 md:px-8 max-w-7xl mx-auto bg-surface/20 border-y border-surface-border">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">Everything you need</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: "ti-brand-github", text: "GitHub OAuth" },
              { icon: "ti-history", text: "Repository Archaeology" },
              { icon: "ti-timeline", text: "Architecture Timeline" },
              { icon: "ti-database-search", text: "Vector Search" },
              { icon: "ti-brain", text: "Claude AI Analysis" },
              { icon: "ti-eye", text: "PR Monitoring" },
              { icon: "ti-shield-x", text: "Conflict Detection" },
              { icon: "ti-history-toggle", text: "Decision History" },
              { icon: "ti-file-text", text: "Living Documentation" },
              { icon: "ti-server-cog", text: "Background Workers" },
              { icon: "ti-users", text: "Team Collaboration" },
              { icon: "ti-bolt", text: "Real-time Updates" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-surface-border bg-surface hover:bg-surface-hover transition-colors">
                <i className={`ti ${feat.icon} text-[18px] text-primary-light`}></i>
                <span className="text-[14px] text-white/80 font-medium">{feat.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-32 md:px-8 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Keep Your Architecture Alive</h2>
          <p className="text-white/60 text-[18px] mb-10 leading-relaxed">
            Stop relying on tribal knowledge. Let DevBoard automatically preserve and protect every architectural decision your team makes.
          </p>
          <div className="flex justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-all hover:scale-105 shadow-[0_0_30px_rgba(85,81,255,0.4)] text-[16px]">
              <i className="ti ti-brand-github text-xl"></i>
              Connect Your GitHub Repository
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
