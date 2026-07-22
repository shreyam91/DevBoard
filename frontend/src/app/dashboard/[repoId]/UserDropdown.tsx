'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, Settings, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative p-3 pt-0" ref={dropdownRef}>
      
      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all group",
          isOpen ? "shadow-md border-slate-300" : "shadow-sm hover:shadow-md hover:border-slate-300"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.image} alt="avatar" className="w-[32px] h-[32px] rounded-full shrink-0 border border-slate-200" />
          ) : (
            <div className="w-[32px] h-[32px] rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-[12px] font-bold shrink-0 group-hover:bg-accent-blue/10 group-hover:text-accent-blue transition-colors">
              {getInitials(user.name || user.email)}
            </div>
          )}
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-[13px] font-semibold text-slate-900 truncate leading-tight">{user.name || user.email}</span>
            <span className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">Developer</span>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1.5 z-50 overflow-hidden origin-bottom animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Signed in as</p>
            <p className="text-[13px] font-bold text-slate-900 truncate mt-0.5">{user.email}</p>
          </div>
          
          <Link href="/settings/profile" onClick={() => setIsOpen(false)} className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-600 hover:text-accent-blue hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <User className="w-4 h-4" />
            Your Profile
          </Link>
          
          <Link href="/settings/preferences" onClick={() => setIsOpen(false)} className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-600 hover:text-accent-blue hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" />
            Preferences
          </Link>

          <div className="h-px bg-slate-100 my-1"></div>

          <Link href="/login" onClick={() => setIsOpen(false)} className="w-full px-4 py-2 text-left text-[13px] font-medium text-accent-red hover:bg-accent-red/5 flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" />
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}
