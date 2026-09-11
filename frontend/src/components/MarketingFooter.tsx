import Link from "next/link";

const PRODUCT = [
  { label: "AI Review", href: "/#context" },
  { label: "Architecture", href: "/#context" },
  { label: "Documentation", href: "/#context" },
];

const RESOURCES = [
  { label: "GitHub", href: "https://github.com/shreyam91/DevBoard" },
  { label: "Documentation", href: "/docs" },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-mono text-[16px] font-bold tracking-tight text-slate-900">DEVHUB</div>
            <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-slate-500">
              Engineering intelligence for GitHub.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Product</div>
            <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
              {PRODUCT.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-slate-900">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Resources</div>
            <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
              {RESOURCES.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined} className="hover:text-slate-900">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-[12px] text-slate-400">© 2026 DevHub</div>
      </div>
    </footer>
  );
}