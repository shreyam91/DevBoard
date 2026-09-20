import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import InteractiveHero from "@/components/landing/InteractiveHero";
import MoreThanDiff from "@/components/landing/MoreThanDiff";
import ProjectMemory from "@/components/landing/ProjectMemory";
import FinalCTA from "@/components/landing/FinalCTA";
import AIReviewSection from "@/components/landing/AIReviewSection";
import GitHubSection from "@/components/landing/GitHubSection";
import LivingDocs from "@/components/landing/LivingDocs";
import TechStrip from "@/components/landing/TechStrip";
import FromContext from "@/components/landing/FromContext";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased font-sans">
      <MarketingNavbar isSignedIn={false} />
      <main>
        <InteractiveHero />
        <MoreThanDiff />
        <ProjectMemory />
        <GitHubSection/>
        <AIReviewSection/>
        <LivingDocs/>
        <TechStrip/>
        {/* <FromContext/> */}
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
