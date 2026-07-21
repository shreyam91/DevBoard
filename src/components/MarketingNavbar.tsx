"use client";

import { useState } from "react";
import Link from "next/link";

export default function MarketingNavbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex h-[56px] items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#0c0c0c] px-6 md:px-8">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5551ff]">
          <i className="ti ti-topology-star-3 text-[15px] text-white"></i>
        </div>
        <span className="text-[14px] font-medium text-white">DevBoard</span>
      </div>

      {/* Center: Links (Desktop) */}
      <div className="hidden items-center gap-6 md:flex">
        <Link href="#features" className="text-[13px] text-[rgba(255,255,255,0.5)] transition-colors hover:text-[rgba(255,255,255,0.85)]">
          Features
        </Link>
        <Link href="#how-it-works" className="text-[13px] text-[rgba(255,255,255,0.5)] transition-colors hover:text-[rgba(255,255,255,0.85)]">
          How it works
        </Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[rgba(255,255,255,0.5)] transition-colors hover:text-[rgba(255,255,255,0.85)]">
          GitHub
        </a>
      </div>

      {/* Right: CTA / Hamburger */}
      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="hidden items-center justify-center rounded-[7px] bg-[#5551ff] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4440ee] md:flex"
          >
            Go to dashboard
          </Link>
        ) : (
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/api/auth/signin"
              className="flex items-center justify-center rounded-[7px] border border-[rgba(255,255,255,0.2)] bg-transparent px-4 py-1.5 text-[13px] font-medium text-[rgba(255,255,255,0.7)] transition-colors hover:border-[rgba(255,255,255,0.4)]"
            >
              Sign in
            </Link>
            <Link
              href="/api/auth/signin"
              className="flex items-center justify-center rounded-[7px] bg-[#5551ff] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4440ee]"
            >
              Get started free
            </Link>
          </div>
        )}
        
        <button
          className="flex items-center justify-center p-1 text-[rgba(255,255,255,0.7)] hover:text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <i className="ti ti-menu-2 text-[20px]"></i>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[56px] flex flex-col border-b border-[rgba(255,255,255,0.08)] bg-[#0c0c0c] p-4 md:hidden shadow-lg">
          <div className="flex flex-col gap-4">
            <Link href="#features" className="text-[14px] text-[rgba(255,255,255,0.7)]" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="text-[14px] text-[rgba(255,255,255,0.7)]" onClick={() => setIsOpen(false)}>
              How it works
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[rgba(255,255,255,0.7)]" onClick={() => setIsOpen(false)}>
              GitHub
            </a>
            <div className="my-2 h-[1px] w-full bg-[rgba(255,255,255,0.08)]"></div>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-[7px] bg-[#5551ff] py-2 text-[14px] font-medium text-white"
                onClick={() => setIsOpen(false)}
              >
                Go to dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/api/auth/signin"
                  className="flex items-center justify-center rounded-[7px] border border-[rgba(255,255,255,0.2)] bg-transparent py-2 text-[14px] font-medium text-[rgba(255,255,255,0.7)]"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="flex items-center justify-center rounded-[7px] bg-[#5551ff] py-2 text-[14px] font-medium text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
