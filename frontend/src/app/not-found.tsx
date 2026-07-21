import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c] text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(85,81,255,0.15)] mb-6">
        <i className="ti ti-ghost text-3xl text-[#9591ff]"></i>
      </div>
      <h2 className="text-[28px] font-medium tracking-tight mb-3">Page not found</h2>
      <p className="text-[14px] text-[rgba(255,255,255,0.5)] mb-8 text-center max-w-[320px]">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        href="/" 
        className="flex items-center justify-center rounded-[8px] bg-[#5551ff] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee]"
      >
        Return to home
      </Link>
    </div>
  );
}
