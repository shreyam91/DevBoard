import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { auth } from "@/auth";

export default async function TermsPage() {
  const session = await auth();
  
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c] text-white">
      <MarketingNavbar isSignedIn={!!session} />
      
      <main className="flex-1 px-6 py-16 md:px-8 max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.5)] mb-10">Last updated: July 2026</p>
        
        <div className="text-[14px] text-[rgba(255,255,255,0.7)] flex flex-col gap-6">
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using DevBoard, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">2. Description of Service</h2>
            <p>DevBoard is a platform that uses AI to track, analyze, and document software architecture decisions within GitHub repositories.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">3. User Accounts</h2>
            <p>You must create an account to use DevBoard. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">4. Intellectual Property</h2>
            <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of DevBoard and its licensors.</p>
          </section>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
