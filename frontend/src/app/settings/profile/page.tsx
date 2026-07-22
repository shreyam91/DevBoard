import React from 'react';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  // Mocked session
  const session = { user: { id: "dev-user", name: "Developer User", email: "dev@devboard.io", image: null } };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Your Profile</h2>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[800px] mx-auto">
          
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              
              {/* Avatar Section */}
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-[80px] h-[80px] rounded-full bg-slate-100 border-2 border-slate-200 text-slate-600 flex items-center justify-center text-[24px] font-bold group-hover:bg-accent-blue/5 group-hover:border-accent-blue/30 transition-all overflow-hidden">
                  {session.user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    "DU"
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">Profile Picture</h3>
                <p className="text-[13px] text-slate-500 mb-3">Upload a picture to personalize your account.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-700 text-[13px] font-semibold rounded-lg transition-all">
                    Upload new
                  </button>
                  <button className="px-4 py-2 bg-transparent text-slate-500 hover:text-accent-red text-[13px] font-medium rounded-lg transition-all">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Full Name</label>
              <input 
                type="text" 
                defaultValue={session.user.name || ''}
                className="w-full max-w-[400px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              />
            </div>

            <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Email Address</label>
              <input 
                type="email" 
                defaultValue={session.user.email || ''}
                className="w-full max-w-[400px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              />
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
                Save Profile
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
