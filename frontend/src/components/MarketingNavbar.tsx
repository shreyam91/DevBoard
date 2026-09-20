"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function MarketingNavbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 md:px-12">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <span className="text-[14px] font-medium text-slate-900 tracking-tight">DevHub</span>
      </Link>

      {/* Center: Links (Desktop) */}
      <div className="hidden items-center gap-6 lg:flex">
        <a href="#product" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Product
        </a>
        <a href="#how-it-works" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          How it works
        </a>
        <a href="#ai-review" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          AI Review
        </a>
        <a href="#architecture" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Architecture
        </a>
        <a href="#documentation" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Documentation
        </a>
      </div>

      {/* Right: CTA / Hamburger */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-5">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
            GitHub
          </a>
          {isSignedIn ? (
            <Link
              href="/overview"
              className="flex items-center justify-center text-[13px] font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Connect GitHub &rarr;
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/overview"
                className="flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Connect GitHub &rarr;
              </Link>
            </>
          )}
        </div>
        
        <button
          className="flex items-center justify-center p-1 text-slate-500 hover:text-slate-900 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[60px] flex flex-col border-b border-slate-200 bg-white p-6 lg:hidden shadow-lg gap-6">
          <div className="flex flex-col gap-4">
            <a href="#product" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>Product</a>
            <a href="#how-it-works" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>How it works</a>
            <a href="#ai-review" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>AI Review</a>
            <a href="#architecture" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>Architecture</a>
            <a href="#documentation" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>Documentation</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-slate-600" onClick={() => setIsOpen(false)}>GitHub</a>
          </div>
          <div className="h-[1px] w-full bg-slate-100"></div>
          {isSignedIn ? (
            <Link
              href="/overview"
              className="flex items-center justify-center rounded-md bg-slate-900 py-2.5 text-[14px] font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Connect GitHub &rarr;
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="block px-3 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
              <Link 
                href="/overview"
                className="flex items-center justify-center rounded-md bg-slate-900 py-2.5 text-[14px] font-medium text-white"
                onClick={() => setIsOpen(false)}
              >
                Connect GitHub &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
