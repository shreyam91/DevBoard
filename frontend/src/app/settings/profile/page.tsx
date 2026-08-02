import React from 'react';
import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Your Profile</h2>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
        <UserProfile />
      </div>
    </div>
  );
}
