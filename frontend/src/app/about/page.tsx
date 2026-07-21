import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { auth } from "@/auth";

export default async function AboutPage() {
  const session = await auth();
  
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c] text-white">
      <MarketingNavbar isSignedIn={!!session} />
      
      <main className="flex-1 px-6 py-16 md:px-8 max-w-[800px] mx-auto w-full text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-[20px] border border-[rgba(85,81,255,0.4)] bg-[rgba(85,81,255,0.15)] px-3 py-1 mx-auto">
          <i className="ti ti-topology-star-3 text-[12px] text-[#9591ff]"></i>
          <span className="text-[11px] font-medium text-[#9591ff]">About DevBoard</span>
        </div>
        
        <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-6">
          Bringing clarity to <br className="hidden md:block"/>
          <span className="text-[#5551ff]">software architecture</span>
        </h1>
        
        <p className="text-[15px] text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto leading-relaxed mb-12">
          We built DevBoard because we were tired of losing architectural context.
          Documentation gets outdated the day it's written, and tribal knowledge
          is lost when team members leave. DevBoard captures intent automatically.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-[rgba(255,255,255,0.08)] pt-12">
          <div className="p-6 rounded-2xl bg-[#121212] border border-[rgba(255,255,255,0.05)]">
            <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <i className="ti ti-robot text-[20px] text-white"></i>
            </div>
            <h3 className="font-medium mb-2">AI-Powered</h3>
            <p className="text-[13px] text-[rgba(255,255,255,0.5)]">We use cutting-edge language models to understand the semantic intent behind code changes.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-[#121212] border border-[rgba(255,255,255,0.05)]">
            <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <i className="ti ti-lock text-[20px] text-white"></i>
            </div>
            <h3 className="font-medium mb-2">Secure by Design</h3>
            <p className="text-[13px] text-[rgba(255,255,255,0.5)]">Your code never trains our models. We maintain strict isolation between tenant environments.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-[#121212] border border-[rgba(255,255,255,0.05)]">
            <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <i className="ti ti-users text-[20px] text-white"></i>
            </div>
            <h3 className="font-medium mb-2">Built for Teams</h3>
            <p className="text-[13px] text-[rgba(255,255,255,0.5)]">Whether you're a startup or an enterprise, DevBoard scales with your engineering organization.</p>
          </div>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
