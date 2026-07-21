'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ 
  href, 
  icon, 
  children,
  exact = false,
  badgeCount = 0
}: { 
  href: string, 
  icon: string, 
  children: React.ReactNode,
  exact?: boolean,
  badgeCount?: number
}) {
  const pathname = usePathname();
  
  const isActive = exact 
    ? pathname === href 
    : pathname.startsWith(href);

  const baseClasses = "flex items-center justify-between px-3 py-2 rounded-md transition-colors relative";
  const activeClasses = "bg-[rgba(85,81,255,0.12)] text-[#ffffff]";
  const defaultClasses = "text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white";

  return (
    <Link href={href} className={`${baseClasses} ${isActive ? activeClasses : defaultClasses}`}>
      <div className="flex items-center gap-2">
        <i className={`${icon} text-[14px]`}></i>
        <span className="text-[12.5px] font-medium">{children}</span>
      </div>
      
      {badgeCount > 0 && (
        <span className="bg-[#A32D2D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}

      {/* Active border indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#5551ff] rounded-r-full"></div>
      )}
    </Link>
  );
}
