import React from 'react';

export default function PreferencesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Preferences</h2>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[800px] mx-auto">
          
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-8">
            
            <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Theme</label>
              <select className="w-full max-w-[250px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all">
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="text-[12px] text-slate-400 mt-1">Select your preferred color theme for the DevBoard interface.</p>
            </div>

            <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Email Notifications</label>
              
              <div className="mt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-accent-blue bg-accent-blue flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 4.5L3.5 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-700 group-hover:text-slate-900">New Architecture Decisions detected</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-accent-blue bg-accent-blue flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 4.5L3.5 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-700 group-hover:text-slate-900">Weekly Architecture Summary</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center">
                  </div>
                  <span className="text-[13px] text-slate-700 group-hover:text-slate-900">DevBoard product updates and news</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
                Save Preferences
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
