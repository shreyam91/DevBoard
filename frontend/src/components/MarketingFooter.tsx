import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] bg-background/80 backdrop-blur-md px-8 py-[20px]">
      <div className="flex items-center gap-2">
        <i className="ti ti-topology-star-3 text-[14px] text-[rgba(255,255,255,0.3)]"></i>
        <span className="text-[12px] font-medium text-[rgba(255,255,255,0.3)]">DevBoard</span>
      </div>
      <div className="flex gap-4 text-[11px] text-[rgba(255,255,255,0.25)]">
        <Link href="/about" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">About</Link>
        <Link href="/contact" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">Contact</Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">GitHub</a>
        <Link href="/privacy" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-[rgba(255,255,255,0.5)] transition-colors">Terms</Link>
      </div>
    </footer>
  );
}
