"use client";

import { motion } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Mail, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => setIsSending(false), 2000); // Fake send animation
  };

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />
      
      <main className="relative z-10 flex-1 px-6 py-6 md:px-12 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-start">
        
        {/* Left Side: Info */}
        <div className="flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-4 shadow-sm self-start"
          >
            <MessageSquare className="w-4 h-4 text-accent-blue" />
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Contact Us</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] md:text-[64px] font-bold tracking-tight mb-2 text-slate-900 leading-[1.1]"
          >
            Let's talk <br/> architecture.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] text-slate-600 leading-relaxed mb-4 max-w-[400px]"
          >
            Whether you have a question about our API, need enterprise support, or just want to share feedback—our engineering team is ready to help.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-8 border-l-2 border-slate-200 pl-6"
          >
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-widest mb-4">Direct Links</h3>
              <div className="flex flex-col gap-3">
                <a href="mailto:hello@devboard.io" className="group flex items-center gap-3 text-[15px] font-medium text-slate-600 hover:text-accent-blue transition-colors">
                  <Mail className="w-5 h-5 text-slate-400 group-hover:text-accent-blue transition-colors" />
                  hello@devboard.io
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  <GithubIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  GitHub Repository
                </a>
                {/* <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-[15px] font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  <LinkedinIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  LinkedIn
                </a> */}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-widest mb-4">Resources</h3>
              <div className="flex flex-col gap-3">
                <Link href="/privacy" className="text-[15px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-300">Privacy Policy</Link>
                <Link href="/terms" className="text-[15px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-300">Terms of Service</Link>
                <Link href="/docs" className="text-[15px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-300">API Documentation</Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form & Illustration */}
        <div className="relative pt-12 lg:pt-0">
          
          {/* Subtle Form Decoration SVG */}
          <svg className="absolute -top-12 -right-12 w-64 h-64 text-slate-200 pointer-events-none z-0" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <motion.path 
              d="M 150,50 L 50,150 M 50,150 L 80,150 M 50,150 L 50,120" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <circle cx="150" cy="50" r="4" fill="currentColor" />
            <motion.path 
              d="M 130,30 Q 150,10 170,30 T 170,70 Q 150,90 130,70 T 130,30" 
              strokeWidth="1" strokeDasharray="4,4" 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "150px 50px" }}
            />
          </svg>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 flex flex-col gap-6 bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700">Full Name</label>
              <input 
                type="text" 
                placeholder="Shaurya "
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                placeholder="shaurya@company.com"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700">Subject</label>
              <input 
                type="text" 
                placeholder="How can we help?"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700">Message</label>
              <textarea 
                rows={4}
                placeholder="Tell us more about your inquiry..."
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 resize-none" 
              ></textarea>
            </div>
            
            <button 
              type="submit"
              disabled={isSending}
              className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-4 text-[15px] font-medium text-white transition-all hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className={isSending ? "opacity-0" : "opacity-100 transition-opacity"}>Send Message</span>
              <Send className={`w-4 h-4 ${isSending ? 'opacity-0' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-all'}`} />
              
              {isSending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </button>
          </motion.form>
        </div>

      </main>
      
      <div className="relative z-10">
        <MarketingFooter />
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

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
