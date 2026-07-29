/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { File, Folder, Box, Server, Database, Globe, Package } from 'lucide-react';
import clsx from 'clsx';

function getIconForType(type: string) {
  switch (type) {
    case 'folder': return <Folder size={14} />;
    case 'file': return <File size={14} />;
    case 'component': return <Box size={14} />;
    case 'service': return <Server size={14} />;
    case 'controller': return <Globe size={14} />;
    case 'model': return <Database size={14} />;
    case 'api': return <Globe size={14} />;
    case 'package': return <Package size={14} />;
    default: return <File size={14} />;
  }
}

function getColorForType(type: string) {
  switch (type) {
    case 'folder': return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'component': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'service': return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'controller': return 'bg-pink-100 text-pink-700 border-pink-300';
    case 'model': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'api': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'package': return 'bg-slate-100 text-slate-700 border-slate-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

const CustomNode = ({ data, isConnectable }: any) => {
  const icon = getIconForType(data.nodeType);
  const colorClass = getColorForType(data.nodeType);

  return (
    <div className={clsx("px-3 py-2 shadow-sm rounded-md border bg-white flex items-center gap-2", colorClass)}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 opacity-0" />
      <div className="flex items-center gap-1.5">
        {icon}
        <div className="font-mono text-xs font-medium">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 opacity-0" />
    </div>
  );
};

export const DatabaseSchemaNode = ({ data, isConnectable }: any) => {
  return (
    <div className="w-48 shadow-sm rounded-md border border-slate-300 bg-white overflow-hidden flex flex-col">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 opacity-0" />
      
      {/* Header */}
      <div className="bg-slate-800 text-white px-3 py-2 flex items-center gap-2">
        <Database size={14} className="text-slate-300" />
        <div className="font-mono text-xs font-semibold truncate">{data.label}</div>
      </div>
      
      {/* Mock Schema Rows */}
      <div className="flex flex-col bg-slate-50">
        <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-700 font-medium">id</span>
          <span className="text-amber-600">String</span>
        </div>
        <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-700 font-medium">created_at</span>
          <span className="text-emerald-600">DateTime</span>
        </div>
        <div className="px-3 py-1.5 flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-700 font-medium">...</span>
          <span className="text-slate-400">fields</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 opacity-0" />
    </div>
  );
};

export const nodeTypes = {
  custom: memo(CustomNode),
  databaseSchema: memo(DatabaseSchemaNode),
};
