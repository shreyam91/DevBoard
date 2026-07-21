import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c]">
      {/* Simple header */}
      <div className="flex h-[56px] items-center px-6 border-b border-[rgba(255,255,255,0.08)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5551ff]">
            <i className="ti ti-topology-star-3 text-[15px] text-white"></i>
          </div>
          <span className="text-[14px] font-medium text-white">DevBoard</span>
        </Link>
      </div>

      {/* Login Box */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[400px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#121212] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-[24px] font-medium text-white mb-2">Welcome back</h1>
            <p className="text-[13px] text-[rgba(255,255,255,0.5)]">
              Sign in to your DevBoard account to continue tracking your architecture.
            </p>
          </div>

          <Link
            href="/api/auth/signin"
            className="flex w-full items-center justify-center gap-3 rounded-[8px] bg-white px-4 py-3 text-[14px] font-medium text-black transition-colors hover:bg-neutral-200"
          >
            <i className="ti ti-brand-github text-[18px]"></i>
            Continue with GitHub
          </Link>

          <p className="mt-6 text-center text-[12px] text-[rgba(255,255,255,0.4)]">
            By signing in, you agree to our <Link href="/terms" className="underline hover:text-white transition-colors">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
