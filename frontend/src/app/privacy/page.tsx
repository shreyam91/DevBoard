"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Database, Key, Cookie, ShieldCheck, UserCheck, Cloud, Clock, ShieldAlert } from "lucide-react";
import { ReactNode } from "react";

export default function PrivacyPolicyPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      {/* Sticky Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent-blue origin-left z-[100]" 
        style={{ scaleX }} 
      />

      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 py-10 md:px-12 max-w-[800px] mx-auto w-full">
        
        {/* Header */}
        <div className="mb-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-accent-blue" />
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Legal</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-bold tracking-tight mb-2 text-slate-900 leading-[1.1]"
          >
            Privacy Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed"
          >
            Last updated: July 22, 2026. <br/>
            We believe that your architecture is your intellectual property. Our privacy practices are designed to protect your codebase while providing intelligent insights.
          </motion.p>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-8"
        >
          <PrivacySection 
            icon={<Database className="w-5 h-5 text-accent-blue" />}
            title="Data Collection"
            content="We collect only the information necessary to provide the DevBoard service. This includes account information (name, email), billing details, and metadata required to operate the application. We explicitly do not store your source code permanently; it is processed in-memory for architectural analysis."
          />

          <PrivacySection 
            icon={<GithubIcon className="w-5 h-5 text-slate-900" />}
            title="GitHub Permissions"
            content="DevBoard requests read-only access to your repositories and pull requests to perform architecture scanning. We request commit status permissions to block PRs that violate your architecture rules. We never request write access to your source code."
          />

          <PrivacySection 
            icon={<Key className="w-5 h-5 text-amber-500" />}
            title="Authentication"
            content="We use OAuth for authentication to ensure we never see or store your passwords. Your authentication tokens are encrypted at rest using AES-256 encryption and rotated according to industry best practices."
          />

          <PrivacySection 
            icon={<Cookie className="w-5 h-5 text-orange-500" />}
            title="Cookies & Tracking"
            content="We use strictly necessary cookies to keep you logged in and secure your session. We use minimal, privacy-friendly analytics to understand product usage, but we do not use invasive third-party tracking pixels for advertising."
          />

          <PrivacySection 
            icon={<ShieldCheck className="w-5 h-5 text-accent-green" />}
            title="Security Practices"
            content="All data transmitted to and from DevBoard is encrypted in transit using TLS 1.3. We maintain strict tenant isolation in our database architecture to ensure your architectural data can never cross-pollinate with other organizations."
          />

          <PrivacySection 
            icon={<UserCheck className="w-5 h-5 text-indigo-500" />}
            title="User Rights"
            content="Under GDPR and CCPA, you have the right to access, modify, or delete your data at any time. Deleting your account will immediately purge all associated metadata, analysis history, and tokens from our systems."
          />

          <PrivacySection 
            icon={<Cloud className="w-5 h-5 text-cyan-500" />}
            title="Third-party Subprocessors"
            content="We use trusted cloud providers (like AWS or Vercel) and payment processors (like Stripe) to deliver our service. All subprocessors are vetted for security compliance and are bound by strict data processing agreements."
          />

          <PrivacySection 
            icon={<Clock className="w-5 h-5 text-rose-500" />}
            title="Data Retention"
            content="Architecture history and PR analysis logs are retained for as long as your account is active. If your subscription lapses, we retain data for 60 days before scheduling it for permanent deletion, giving you time to export or renew."
          />

        </motion.div>
      </main>
      
      <div className="relative z-10">
        <MarketingFooter />
      </div>
    </div>
  );
}

function PrivacySection({ icon, title, content }: { icon: ReactNode, title: string, content: string }) {
  return (
    <div className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-[18px] font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
