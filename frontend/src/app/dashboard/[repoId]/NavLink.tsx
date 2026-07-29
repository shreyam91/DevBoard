'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/utils/cn";

import { LucideIcon } from 'lucide-react';

export default function NavLink({ 
  href, 
  icon, 
  children,
  exact = false,
  badgeCount = 0
}: { 
  href: string, 
  icon: React.ReactNode, 
  children: React.ReactNode,
  exact?: boolean,
  badgeCount?: number
}) {
  const pathname = usePathname();
  
  const isActive = exact 
    ? pathname === href 
    : pathname.startsWith(href);

  return (
    <Link 
      href={href} 
      prefetch={false}
      className={cn(
        "group flex items-center justify-between px-3 py-2 rounded-lg transition-all relative font-medium text-[13px]",
        isActive 
          ? "bg-white border border-slate-200 shadow-sm text-accent-blue" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 transition-colors",
          isActive ? "text-accent-blue" : "text-slate-400 group-hover:text-slate-600"
        )}>
          {icon}
        </span>
        <span>{children}</span>
      </div>
      
      {badgeCount > 0 && (
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded leading-none transition-colors",
          isActive ? "bg-accent-red/10 text-accent-red" : "bg-accent-red text-white"
        )}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  );
}
