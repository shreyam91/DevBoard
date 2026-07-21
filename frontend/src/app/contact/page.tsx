import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { auth } from "@/auth";

export default async function ContactPage() {
  const session = await auth();
  
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c] text-white">
      <MarketingNavbar isSignedIn={!!session} />
      
      <main className="flex-1 px-6 py-16 md:px-8 max-w-[600px] mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium tracking-tight mb-3">Get in touch</h1>
          <p className="text-[14px] text-[rgba(255,255,255,0.5)]">
            Have questions about DevBoard? We'd love to hear from you.
          </p>
        </div>
        
        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[rgba(255,255,255,0.8)]">Name</label>
            <input 
              type="text" 
              placeholder="Your name"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-transparent px-4 py-2.5 text-[14px] text-white outline-none transition-colors focus:border-[#5551ff] focus:bg-[rgba(255,255,255,0.02)]" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[rgba(255,255,255,0.8)]">Email</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-transparent px-4 py-2.5 text-[14px] text-white outline-none transition-colors focus:border-[#5551ff] focus:bg-[rgba(255,255,255,0.02)]" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[rgba(255,255,255,0.8)]">Message</label>
            <textarea 
              rows={5}
              placeholder="How can we help?"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-transparent px-4 py-2.5 text-[14px] text-white outline-none transition-colors focus:border-[#5551ff] focus:bg-[rgba(255,255,255,0.02)] resize-none" 
            ></textarea>
          </div>
          
          <button 
            type="button"
            className="mt-2 flex w-full items-center justify-center rounded-[8px] bg-[#5551ff] px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#4440ee]"
          >
            Send message
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col items-center text-center">
          <p className="text-[13px] text-[rgba(255,255,255,0.5)] mb-2">Or email us directly at</p>
          <a href="mailto:hello@devboard.io" className="text-[15px] font-medium text-white hover:text-[#5551ff] transition-colors">hello@devboard.io</a>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
