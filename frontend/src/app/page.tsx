import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import Hero from "@/components/landing/Hero";
import GitHubSection from "@/components/landing/GitHubSection";
import FromContext from "@/components/landing/FromContext";
import AIReviewSection from "@/components/landing/AIReviewSection";
import LivingDocs from "@/components/landing/LivingDocs";
import TechStrip from "@/components/landing/TechStrip";
import FinalCTA from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <MarketingNavbar isSignedIn={false} />
      <main>
        <Hero />
        <GitHubSection />
        <FromContext />
        <AIReviewSection />
        <LivingDocs />
        <TechStrip />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
