"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function MarketingNavbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 md:px-12">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-slate-900 tracking-tight">DevBoard</span>
      </Link>

      {/* Center: Links (Desktop) */}
      <div className="hidden items-center gap-8 md:flex">
        <Link href="/#features" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Features
        </Link>
        <Link href="/#how-it-works" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          How it works
        </Link>
        <Link href="/about" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          About
        </Link>
        <Link href="/contact" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Contact
        </Link>
      </div>

      {/* Right: CTA / Hamburger */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
            GitHub
          </a> */}
          {/* <div className="w-[1px] h-4 bg-slate-200"></div> */}
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-in"
                className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white transition-transform hover:scale-[1.02] shadow-sm"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
        
        <button
          className="flex items-center justify-center p-1 text-slate-500 hover:text-slate-900 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[60px] flex flex-col border-b border-slate-200 bg-white p-6 md:hidden shadow-lg gap-6">
          <div className="flex flex-col gap-4">
            <Link href="/#features" className="text-[15px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="text-[15px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>How it works</Link>
            <Link href="/about" className="text-[15px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" className="text-[15px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>Contact</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>GitHub</a>
          </div>
          <div className="h-[1px] w-full bg-slate-100"></div>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-md bg-black py-2.5 text-[15px] font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Go to dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-accent-blue hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/sign-in"
                className="flex items-center justify-center rounded-md bg-black py-2.5 text-[15px] font-medium text-white"
                onClick={() => setIsOpen(false)}
              >
                Get started free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
