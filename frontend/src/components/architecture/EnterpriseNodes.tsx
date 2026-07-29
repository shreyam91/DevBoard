import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Folder, Database, Globe, Server, Shield, 
  HardDrive, Activity, Layout, FileCode, Layers, ChevronDown, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

// Map colors to gradients and styles
const themeColors: Record<string, { bg: string, border: string, text: string, iconBg: string }> = {
  blue: { bg: 'bg-blue-50/90', border: 'border-blue-200', text: 'text-blue-800', iconBg: 'bg-blue-500' },
  green: { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-800', iconBg: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-50/90', border: 'border-purple-200', text: 'text-purple-800', iconBg: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50/90', border: 'border-orange-200', text: 'text-orange-800', iconBg: 'bg-orange-500' },
  red: { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-800', iconBg: 'bg-rose-500' },
  yellow: { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-800', iconBg: 'bg-amber-500' },
  cyan: { bg: 'bg-cyan-50/90', border: 'border-cyan-200', text: 'text-cyan-800', iconBg: 'bg-cyan-500' },
  pink: { bg: 'bg-pink-50/90', border: 'border-pink-200', text: 'text-pink-800', iconBg: 'bg-pink-500' },
  slate: { bg: 'bg-slate-50/90', border: 'border-slate-200', text: 'text-slate-800', iconBg: 'bg-slate-500' },
};

function getIcon(iconName: string) {
  switch (iconName) {
    case 'folder': return <Folder size={16} className="text-white" />;
    case 'database': return <Database size={16} className="text-white" />;
    case 'api': return <Globe size={16} className="text-white" />;
    case 'service': return <Server size={16} className="text-white" />;
    case 'auth': return <Shield size={16} className="text-white" />;
    case 'storage': return <HardDrive size={16} className="text-white" />;
    case 'monitor': return <Activity size={16} className="text-white" />;
    case 'layout': return <Layout size={16} className="text-white" />;
    case 'code': return <FileCode size={16} className="text-white" />;
    case 'layers': return <Layers size={16} className="text-white" />;
    default: return <Folder size={16} className="text-white" />;
  }
}

export const GroupNode = memo(({ data }: any) => {
  const t = themeColors[data.color || 'slate'];
  const expanded = data.expanded !== false; // Default true
  
  return (
    <div className={clsx(
      "rounded-xl border-2 shadow-lg backdrop-blur-md transition-all",
      t.bg, t.border
    )} style={{ width: data.width || 300, height: data.height || 200 }}>
      {/* Header */}
      <div className={clsx("flex items-center justify-between px-4 py-2 border-b border-black/5 bg-white/50 rounded-t-xl")}>
        <div className="flex items-center gap-2">
          <div className={clsx("p-1.5 rounded-lg shadow-inner", t.iconBg)}>
            {getIcon(data.icon)}
          </div>
          <div className="font-semibold text-sm">{data.label}</div>
        </div>
        <div className="flex items-center gap-2">
          {data.count && (
            <div className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">
              {data.count}
            </div>
          )}
          <button 
            className="p-1 hover:bg-black/10 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onToggle) data.onToggle(data.id);
            }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
      {/* Handle for connecting groups */}
      <Handle type="target" position={Position.Left} className="w-0 h-0 opacity-0" />
      <Handle type="source" position={Position.Right} className="w-0 h-0 opacity-0" />
    </div>
  );
});
GroupNode.displayName = 'GroupNode';

export const DetailNode = memo(({ data, selected }: any) => {
  const t = themeColors[data.color || 'slate'];
  
  return (
    <div className={clsx(
      "px-3 py-2.5 rounded-lg border shadow-sm bg-white flex items-center gap-3 transition-all cursor-pointer min-w-[180px]",
      selected ? "ring-2 ring-offset-2 ring-blue-400 border-transparent shadow-md transform -translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-md border-slate-200"
    )}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 rounded-full border-2 bg-white" />
      
      <div className={clsx("p-1.5 rounded-md", t.iconBg)}>
        {getIcon(data.icon)}
      </div>
      
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-xs text-slate-800">{data.label}</span>
        {data.subtitle && <span className="text-[9px] text-slate-500 uppercase tracking-wider">{data.subtitle}</span>}
      </div>
      
      {data.status && (
        <div className={clsx("w-2 h-2 rounded-full", data.status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500')} />
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 rounded-full border-2 bg-white" />
    </div>
  );
});
DetailNode.displayName = 'DetailNode';

export const DatabaseTableNode = memo(({ data, selected }: any) => {
  const columns = data.columns || [];
  
  return (
    <div className={clsx(
      "w-56 shadow-md border-2 bg-white overflow-hidden flex flex-col transition-all",
      selected ? "ring-2 ring-offset-2 ring-emerald-400 border-emerald-400" : "border-emerald-200 hover:border-emerald-400",
      "rounded-[20px]" // Cylinder look via rounded corners
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      
      {/* Cylinder Header */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 text-white px-4 pt-4 pb-3 flex items-center gap-2 border-b-4 border-emerald-900 rounded-t-[16px] shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-md -top-6 -left-6 w-24 h-24" />
        <Database size={16} className="text-emerald-100 z-10" />
        <div className="font-mono text-sm font-bold truncate z-10 drop-shadow-md">{data.label}</div>
      </div>
      
      {/* Columns */}
      <div className="flex flex-col bg-slate-50 py-2">
        {columns.map((col: any, i: number) => (
          <div key={i} className="px-4 py-1.5 flex justify-between items-center text-[11px] font-mono hover:bg-slate-100 transition-colors">
            <span className={clsx("font-semibold", col.isPrimary ? "text-amber-600" : "text-slate-700")}>
              {col.name} {col.isPrimary && '🔑'}
            </span>
            <span className="text-slate-400">{col.type}</span>
          </div>
        ))}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
});
DatabaseTableNode.displayName = 'DatabaseTableNode';

export const enterpriseNodeTypes = {
  groupNode: GroupNode,
  detailNode: DetailNode,
  databaseTableNode: DatabaseTableNode,
};
