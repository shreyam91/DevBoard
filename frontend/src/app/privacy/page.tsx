import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { auth } from "@/auth";

export default async function PrivacyPage() {
  const session = await auth();
  
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c] text-white">
      <MarketingNavbar isSignedIn={!!session} />
      
      <main className="flex-1 px-6 py-16 md:px-8 max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.5)] mb-10">Last updated: July 2026</p>
        
        <div className="text-[14px] text-[rgba(255,255,255,0.7)] flex flex-col gap-6">
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">1. Introduction</h2>
            <p>We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website DevBoard.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">2. Data Collection</h2>
            <p>We collect information you provide directly to us when you create an account, connect your repositories, or communicate with us. This includes your name, email, and GitHub repository data.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">3. Data Usage</h2>
            <p>We use your data strictly to provide the DevBoard service, analyze architecture, and improve our AI models. We do not sell your personal information or your codebase data.</p>
          </section>
          
          <section>
            <h2 className="text-[20px] font-medium text-white mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
          </section>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
