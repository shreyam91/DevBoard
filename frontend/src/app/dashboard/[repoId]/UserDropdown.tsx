'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';

export default function UserDropdown() {
  return (
    <div className="relative p-3 pt-0 flex justify-center w-full">
      <UserButton 
        appearance={{
          elements: {
            userButtonBox: "w-full p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all group shadow-sm hover:shadow-md hover:border-slate-300",
            userButtonTrigger: "w-full focus:shadow-none focus:outline-none",
            userButtonAvatarBox: "w-[32px] h-[32px] border border-slate-200"
          }
        }}
        showName={true}
      />
    </div>
  );
}
