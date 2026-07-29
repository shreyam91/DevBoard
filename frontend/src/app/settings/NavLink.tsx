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
}: { 
  href: string, 
  icon: React.ReactNode, 
  children: React.ReactNode,
  exact?: boolean,
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
    </Link>
  );
}
