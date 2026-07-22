import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function MarketingFooter() {
  return (
    <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 bg-white px-6 md:px-12 py-8 gap-6">
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-slate-400" />
        <span className="text-[13px] font-semibold tracking-tight text-slate-400">DevBoard</span>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-[13px] font-medium text-slate-500">
        <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
        <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
        <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
      </div>
    </footer>
  );
}
