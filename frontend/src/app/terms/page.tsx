"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Scale, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance" },
  { id: "accounts", title: "Accounts" },
  { id: "github", title: "GitHub Integration" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "ai-features", title: "AI Features" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
];

export default function TermsOfServicePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeSection, setActiveSection] = useState<string>("acceptance");

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      {/* Sticky Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent-blue origin-left z-[100]" 
        style={{ scaleX }} 
      />

      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 py-10 md:px-12 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-[250px_1fr] gap-16 items-start">
        
        {/* Left: Sticky TOC (Desktop) */}
        <aside className="hidden md:flex flex-col sticky top-32">
          <div className="text-[12px] font-bold tracking-widest text-slate-400 uppercase mb-6">On this page</div>
          <nav className="flex flex-col gap-3 border-l-2 border-slate-100 pl-4">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={cn(
                  "text-left text-[14px] font-medium transition-colors hover:text-slate-900",
                  activeSection === section.id ? "text-accent-blue" : "text-slate-500"
                )}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: Content */}
        <div className="flex flex-col">
          
          <div className=" border-b border-slate-200 pb-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-8 shadow-sm"
            >
              <Scale className="w-4 h-4 text-accent-blue" />
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Legal</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[40px] md:text-[56px] font-bold tracking-tight mb-2 text-slate-900 leading-[1.1]"
            >
              Terms of Service
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed"
            >
              Last updated: July 22, 2026. <br/>
              Please read these terms carefully before using DevBoard.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-12 text-[15px] text-slate-600 leading-relaxed"
          >
            <section id="acceptance" className="scroll-mt-12">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Acceptance</h2>
              <p>By accessing and using DevBoard, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our service. These terms apply to all visitors, users, and others who access or use DevBoard.</p>
            </section>

            <section id="accounts" className="scroll-mt-12">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Accounts</h2>
              <p className="mb-4">When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
              <p>You are responsible for safeguarding the password and GitHub OAuth permissions that you use to access the service. You agree not to disclose your password to any third party.</p>
            </section>

            <section id="github" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">GitHub Integration</h2>
              <p>DevBoard requires integration with your GitHub account to function. By connecting your GitHub account, you grant us permission to read your repositories and pull requests for the sole purpose of architectural analysis and conflict detection. We do not acquire any ownership rights over your source code.</p>
            </section>

            <section id="acceptable-use" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Acceptable Use</h2>
              <p>You agree not to use DevBoard to:</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Reverse engineer, decompile, or disassemble any aspect of the service.</li>
                <li>Upload viruses, malicious code, or use the service for any illegal activities.</li>
                <li>Attempt to bypass or break any security mechanism of the service.</li>
                <li>Share your account credentials with unauthorized users.</li>
              </ul>
            </section>

            <section id="intellectual-property" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Intellectual Property</h2>
              <p>The DevBoard service, including its original content, features, functionality, and AI models, are owned by DevBoard Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
              <p className="mt-4">Your architecture, source code, and generated Living Documentation remain your exclusive intellectual property.</p>
            </section>

            <section id="ai-features" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">AI Features</h2>
              <p>DevBoard uses artificial intelligence to generate architectural insights. While we strive for accuracy, AI-generated documentation and conflict detection are provided "as is". You are responsible for reviewing and verifying any architectural decisions generated by the platform before relying on them for critical engineering workflows.</p>
            </section>

            <section id="liability" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Limitation of Liability</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-2 flex flex-col md:flex-row gap-4 items-start">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="text-[14px] text-amber-900">
                  <strong className="block mb-2 font-semibold">Important Notice</strong>
                  In no event shall DevBoard Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; or (iii) unauthorized access, use or alteration of your transmissions or content.
                </div>
              </div>
            </section>

            <section id="termination" className="scroll-mt-32">
              <h2 className="text-[24px] font-semibold text-slate-900 mb-2">Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease, and your data will be queued for deletion according to our Privacy Policy.</p>
            </section>
            
          </motion.div>
        </div>

      </main>
      
      <div className="relative z-10">
        <MarketingFooter />
      </div>
    </div>
  );
}
