import { auth } from "@/auth";
import MarketingNavbar from "@/components/MarketingNavbar";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const isSignedIn = !!session;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-[#5551ff] selection:text-white">
      <MarketingNavbar isSignedIn={isSignedIn} />

      {/* 2. HERO */}
      <section className="flex flex-col items-center border-b border-[rgba(255,255,255,0.08)] px-6 pb-[60px] pt-[72px] text-center md:px-8">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-[20px] border border-[rgba(85,81,255,0.4)] bg-[rgba(85,81,255,0.15)] px-3 py-1">
          <i className="ti ti-sparkles text-[12px] text-[#9591ff]"></i>
          <span className="text-[11px] font-medium text-[#9591ff]">Powered by Claude AI</span>
        </div>

        <h1 className="mx-auto max-w-[520px] text-[28px] font-medium leading-tight tracking-[-0.02em] md:text-[38px]">
          Your architecture,<br />
          <span className="text-[#5551ff]">documented automatically</span>
        </h1>

        <p className="mx-auto mt-5 max-w-[420px] text-[15px] leading-[1.65] text-[rgba(255,255,255,0.5)]">
          DevBoard tracks every architectural decision your team makes — from the first commit to the latest PR — and tells you when something conflicts.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-2.5 md:w-auto md:flex-row">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#5551ff] px-[22px] py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee] md:w-auto"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/api/auth/signin"
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#5551ff] px-[22px] py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee] md:w-auto"
              >
                <i className="ti ti-brand-github text-[14px]"></i>
                Continue with GitHub
              </Link>
              <a
                href="#preview"
                className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(255,255,255,0.15)] bg-transparent px-[22px] py-[10px] text-[14px] font-medium text-[rgba(255,255,255,0.65)] transition-colors hover:border-[rgba(255,255,255,0.4)] md:w-auto"
              >
                <i className="ti ti-player-play text-[14px]"></i>
                See a demo
              </a>
            </>
          )}
        </div>
        
        {!isSignedIn && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.25)]">
            <i className="ti ti-lock text-[12px]"></i>
            Free to start · No credit card needed
          </div>
        )}

        {/* App Preview Screenshot */}
        <div id="preview" className="mt-[36px] w-full max-w-[800px] overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] shadow-2xl">
          {/* Browser Chrome Bar */}
          <div className="flex h-10 items-center border-b border-[rgba(255,255,255,0.06)] px-4">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#E24B4A]"></div>
              <div className="h-3 w-3 rounded-full bg-[#EF9F27]"></div>
              <div className="h-3 w-3 rounded-full bg-[#1D9E75]"></div>
            </div>
            <div className="mx-auto flex h-6 w-full max-w-[300px] items-center justify-center rounded bg-[#1a1a1a] text-[11px] text-[rgba(255,255,255,0.3)]">
              app.devboard.io/dashboard/my-saas-app
            </div>
            <div className="w-[52px]"></div> {/* Spacer to center URL */}
          </div>
          {/* Fake App Layout */}
          <div className="flex h-[400px] text-left">
            {/* Left Sidebar */}
            <div className="hidden w-[160px] flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0c0c0c] p-3 sm:flex">
              <div className="mb-4 mt-2 px-2 text-[10px] font-medium uppercase tracking-wider text-[rgba(255,255,255,0.3)]">Project</div>
              <div className="flex cursor-pointer items-center gap-2 border-l-2 border-[#5551ff] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-[12px] text-white">
                Overview
              </div>
              <div className="flex cursor-pointer items-center gap-2 border-l-2 border-transparent px-3 py-1.5 text-[12px] text-[rgba(255,255,255,0.5)]">
                Timeline
              </div>
              <div className="flex cursor-pointer items-center justify-between border-l-2 border-transparent px-3 py-1.5 text-[12px] text-[rgba(255,255,255,0.5)]">
                <span>Conflicts</span>
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E24B4A] px-1 text-[9px] font-medium text-white">2</span>
              </div>
              <div className="mt-4 flex cursor-pointer items-center gap-2 border-l-2 border-transparent px-3 py-1.5 text-[12px] text-[rgba(255,255,255,0.5)]">
                ARCHITECTURE.md
              </div>
            </div>
            {/* Right Column */}
            <div className="flex-1 bg-[#0c0c0c] p-5">
              {/* Metric Cards Row */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="flex flex-col rounded-[6px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] p-3">
                  <span className="text-[11px] text-[rgba(255,255,255,0.5)]">Decisions</span>
                  <span className="mt-1 text-[18px] font-medium text-white">24</span>
                </div>
                <div className="flex flex-col rounded-[6px] border border-[rgba(226,75,74,0.3)] bg-[#1a1a1a] p-3">
                  <span className="text-[11px] text-[#F09595]">Conflicts</span>
                  <span className="mt-1 text-[18px] font-medium text-[#F09595]">2</span>
                </div>
                <div className="flex flex-col rounded-[6px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] p-3">
                  <span className="text-[11px] text-[rgba(255,255,255,0.5)]">PRs analyzed</span>
                  <span className="mt-1 text-[18px] font-medium text-white">138</span>
                </div>
              </div>
              {/* Decision Cards */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col rounded-[6px] border border-[rgba(226,75,74,0.4)] bg-[#1a1a1a] p-4">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-alert-triangle text-[14px] text-[#F09595]"></i>
                    <span className="text-[13px] font-medium text-white">Auth state management conflict</span>
                  </div>
                  <p className="mt-2 text-[12px] text-[rgba(255,255,255,0.5)]">
                    PR #142 introduces Redux for auth state, but ARCHITECTURE.md specifies Context API.
                  </p>
                </div>
                <div className="flex flex-col rounded-[6px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Switch to PostgreSQL</span>
                    <span className="rounded bg-[rgba(85,81,255,0.15)] px-1.5 py-0.5 text-[10px] text-[#9591ff]">Database</span>
                  </div>
                  <p className="mt-2 text-[12px] text-[rgba(255,255,255,0.5)]">
                    Migrating from MongoDB to PostgreSQL for better relational queries and consistency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="border-b border-[rgba(255,255,255,0.08)] px-8 py-[56px]">
        <div className="text-center">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#5551ff]">Features</div>
          <h2 className="mb-3 text-[26px] font-medium text-white">Everything your architecture needs</h2>
          <p className="mx-auto mb-[36px] max-w-[500px] text-[13px] text-[rgba(255,255,255,0.4)]">
            Works with new repos and existing ones. No manual setup required.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-3 md:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(85,81,255,0.15)] text-[#9591ff]">
              <i className="ti ti-search text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">Repo archaeology</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">Scans your entire git history to reconstruct past decisions automatically.</p>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(29,158,117,0.15)] text-[#5DCAA5]">
              <i className="ti ti-git-pull-request text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">PR conflict detection</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">Every merged PR is checked against your documented architecture in real time.</p>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(186,117,23,0.15)] text-[#EF9F27]">
              <i className="ti ti-file-code text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">Auto-generated ARCHITECTURE.md</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">A living document committed to your repo, always reflecting current decisions.</p>
          </div>
          {/* Card 4 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(55,138,221,0.15)] text-[#85B7EB]">
              <i className="ti ti-timeline text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">Decision timeline</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">Visual history of every architectural choice, when it was made and why.</p>
          </div>
          {/* Card 5 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(226,75,74,0.15)] text-[#F09595]">
              <i className="ti ti-alert-triangle text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">Conflict alerts</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">Catch contradictions before they become technical debt. Resolve or override with one click.</p>
          </div>
          {/* Card 6 */}
          <div className="flex flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5 transition-colors hover:border-[rgba(255,255,255,0.15)]">
            <div className="mb-4 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[rgba(136,135,128,0.15)] text-[#B4B2A9]">
              <i className="ti ti-sparkles text-[18px]"></i>
            </div>
            <h3 className="mb-2 text-[14px] font-medium text-white">AI-suggested decisions</h3>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">Claude detects implicit decisions in your PRs and surfaces them for confirmation.</p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-[rgba(255,255,255,0.08)] px-8 py-[56px]">
        <div className="text-center">
          <h2 className="mb-[36px] text-[26px] font-medium text-white">Up and running in minutes</h2>
        </div>

        <div className="mx-auto flex max-w-[900px] flex-col gap-10 md:relative md:flex-row md:gap-0">
          {/* Connector Line (Desktop) */}
          <div className="absolute left-[16%] right-[16%] top-[18px] hidden h-[1px] bg-[rgba(255,255,255,0.1)] md:block"></div>

          {/* Step 1 */}
          <div className="flex flex-1 flex-col items-center px-4 text-center">
            <div className="relative z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#5551ff] bg-[#5551ff] text-[13px] font-medium text-white">
              1
            </div>
            <h3 className="mb-1.5 mt-[14px] text-[13px] font-medium text-white">Connect your repo</h3>
            <p className="text-[12px] leading-[1.6] text-[rgba(255,255,255,0.4)]">
              Sign in with GitHub and connect any repo — new or existing.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-1 flex-col items-center px-4 text-center">
            <div className="relative z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] bg-[#0c0c0c] text-[13px] font-medium text-[rgba(255,255,255,0.5)]">
              2
            </div>
            <h3 className="mb-1.5 mt-[14px] text-[13px] font-medium text-white">DevBoard scans it</h3>
            <p className="text-[12px] leading-[1.6] text-[rgba(255,255,255,0.4)]">
              Archaeology mode reconstructs your history. New repos get a guided setup.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-1 flex-col items-center px-4 text-center">
            <div className="relative z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] bg-[#0c0c0c] text-[13px] font-medium text-[rgba(255,255,255,0.5)]">
              3
            </div>
            <h3 className="mb-1.5 mt-[14px] text-[13px] font-medium text-white">Stay in sync</h3>
            <p className="text-[12px] leading-[1.6] text-[rgba(255,255,255,0.4)]">
              Every PR is checked against your architecture. Conflicts surface instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="px-8 py-[64px] text-center">
        <h2 className="mb-2 text-[28px] font-medium tracking-[-0.01em] text-white">Start tracking your architecture today</h2>
        <p className="mx-auto mb-[28px] text-[13px] text-[rgba(255,255,255,0.4)]">
          Free to start. Connect your first repo in under 2 minutes.
        </p>
        <div className="flex justify-center">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#5551ff] px-[22px] py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee] md:w-auto"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              href="/api/auth/signin"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#5551ff] px-[22px] py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee] md:w-auto"
            >
              <i className="ti ti-brand-github text-[14px]"></i>
              Continue with GitHub
            </Link>
          )}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] px-8 py-[20px]">
        <div className="flex items-center gap-2">
          <i className="ti ti-topology-star-3 text-[14px] text-[rgba(255,255,255,0.3)]"></i>
          <span className="text-[12px] font-medium text-[rgba(255,255,255,0.3)]">DevBoard</span>
        </div>
        <div className="flex gap-4 text-[11px] text-[rgba(255,255,255,0.25)]">
          <a href="#" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">GitHub</a>
          <a href="#" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}
