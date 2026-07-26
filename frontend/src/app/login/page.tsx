import Link from "next/link";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-16">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-xl shadow-slate-200/50">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue/10 mb-6 border border-accent-blue/20">
              <i className="ti ti-topology-star-3 text-[24px] text-accent-blue"></i>
            </div>
            <h1 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Welcome back</h1>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Sign in to DevBoard to continue tracking your architectural decisions.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
            className="w-full"
          >
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow"
            >
              <GithubIcon className="w-5 h-5 text-slate-700 group-hover:text-black transition-colors" />
              Continue with GitHub
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-slate-400 leading-relaxed">
            By signing in, you agree to our <Link href="/terms" className="underline hover:text-slate-600 transition-colors">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
