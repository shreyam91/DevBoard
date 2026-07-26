"use client";

import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Background } from "@/components/landing/Background";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { SolutionFeatures } from "@/components/landing/Features";
import { Comparison } from "@/components/landing/Comparison";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-accent-blue/20 text-slate-900 overflow-hidden relative">
      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex flex-col pt-10">
        <Hero />
        <Problem />
        <SolutionFeatures />
        <Comparison />
        <FinalCTA />
      </main>

      <MarketingFooter />
    </div>
  );
}
