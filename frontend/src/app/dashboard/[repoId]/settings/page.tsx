import React from 'react';
import SettingsClient from './SettingsClient';

export default function SettingsPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Top bar */}
      <header className="h-[64px] bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Repository Settings</h2>
          <div className="w-px h-4 bg-slate-300"></div>
          <span className="text-[13px] font-medium text-slate-500">Configure DevBoard for {repoId}</span>
        </div>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[800px] mx-auto">
          
          {/* General Settings */}
          <div className="mb-12">
            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">General Settings</h3>
            <p className="text-[13px] text-slate-500 mb-6">Manage how DevBoard tracks architecture for this repository.</p>

            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-700">Repository Name</label>
                <input 
                  type="text" 
                  defaultValue={repoId}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px] text-slate-500 font-mono outline-none cursor-not-allowed"
                />
                <p className="text-[12px] text-slate-400 mt-1">The repository name is synced with GitHub and cannot be changed here.</p>
              </div>

              <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-700">Default Branch</label>
                <select className="w-full max-w-[250px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all">
                  <option value="main">main</option>
                  <option value="master">master</option>
                  <option value="dev">dev</option>
                </select>
                <p className="text-[12px] text-slate-400 mt-1">DevBoard will base its architectural history off this branch.</p>
              </div>

              <div className="p-6 flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-700">AI Tracking Sensitivity</label>
                <select className="w-full max-w-[250px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all">
                  <option value="high">High (Log all changes)</option>
                  <option value="medium">Medium (Major patterns)</option>
                  <option value="low">Low (Strictly manual)</option>
                </select>
                <p className="text-[12px] text-slate-400 mt-1">Determine how aggressively the AI scans your PRs for architectural shifts.</p>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
                <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mb-12">
            <h3 className="text-[18px] font-bold text-accent-red tracking-tight mb-1">Danger Zone</h3>
            <p className="text-[13px] text-slate-500 mb-6">Irreversible actions that affect this repository.</p>

            <SettingsClient repoId={repoId} />
          </div>

        </div>
      </div>
    </div>
  );
}
