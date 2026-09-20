import React from 'react';
import Link from 'next/link';
import { Background } from '@/components/landing/Background';
import { User, Settings, ArrowLeft, Box } from 'lucide-react';
import NavLink from './NavLink';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden text-[13px] text-slate-900 font-sans selection:bg-accent-blue/20 relative">
      <Background />
      
      {/* Sidebar */}
      <aside className="w-[240px] bg-slate-50/80 backdrop-blur-md flex flex-col shrink-0 border-r border-slate-200 z-20 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Logo block */}
        <div className="pt-8 pb-6 px-5 border-b border-slate-200/60">
          <Link href="/overview" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-[32px] h-[32px] bg-accent-blue rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-accent-blue/20">
              <Box className="text-white w-[18px] h-[18px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">DevBoard</span>
              <span className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">Account Settings</span>
            </div>
          </Link>
          
          <Link href="/overview" className="mt-6 rounded-lg bg-white border border-slate-200 shadow-sm p-2 flex items-center justify-center gap-2 cursor-pointer hover:border-slate-300 hover:shadow transition-all group">
            <ArrowLeft className="text-slate-400 group-hover:text-slate-600 w-4 h-4 transition-colors shrink-0" />
            <span className="text-slate-700 font-semibold text-[13px]">Back to Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5">
          <div className="mb-2 px-3 text-[10px] uppercase text-slate-400 font-bold tracking-widest">Personal</div>
          <NavLink href="/settings/profile" icon={<User />}>
            Your Profile
          </NavLink>
          <NavLink href="/settings/preferences" icon={<Settings />}>
            Preferences
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {children}
      </main>
      
    </div>
  );
}
