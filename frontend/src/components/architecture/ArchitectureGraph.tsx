/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  ReactFlowProvider,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { nodeTypes } from './CustomNodes';
import { edgeTypes } from './CustomEdges';
import { Play, RotateCw, Box, Layers } from 'lucide-react';
import { EnterpriseArchitecture } from './EnterpriseArchitecture';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 40 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 150 / 2,
        y: nodeWithPosition.y - 40 / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export function ArchitectureGraphInner({ repoId }: { repoId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchGraph = useCallback(async (forceGenerate = false) => {
    try {
      setIsLoading(true);
      if (forceGenerate) setIsAnalyzing(true);

      const method = forceGenerate ? 'POST' : 'GET';
      const res = await fetch(`/api/repos/${repoId}/architecture`, { method });
      
      if (!res.ok) {
        if (!forceGenerate && res.status === 404) {
          // It hasn't been generated yet, we don't error, just let user generate it
          setNodes([]);
          setEdges([]);
        } else {
          throw new Error('Failed to fetch architecture graph');
        }
      } else {
        const data = await res.json();
        if (data.graph_data) {
          const rawNodes = data.graph_data.nodes.map((n: any) => ({
            id: n.id,
            type: 'custom',
            data: { label: n.label, nodeType: n.type }
          }));
          
          const rawEdges = data.graph_data.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'smoothstep',
            animated: e.type === 'animated-svg-edge' || e.type === 'data-edge',
            data: e.data || {},
            style: { stroke: '#94a3b8' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
          }));

          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes,
            rawEdges,
            'LR'
          );

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, [repoId, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-slate-50 relative">
      {nodes.length === 0 && !isLoading && !isAnalyzing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-50/90 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md">
            <Box size={48} className="mx-auto text-accent-blue mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Analyze Architecture</h2>
            <p className="text-sm text-slate-500 mb-6">Generate an interactive dependency graph for your repository to visualize imports, modules, and components.</p>
            <button
              onClick={() => fetchGraph(true)}
              className="px-6 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors mx-auto"
            >
              <Play size={16} /> Run Analysis
            </button>
          </div>
        </div>
      ) : null}

      {(isLoading || isAnalyzing) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-50/90 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-blue/20 border-t-accent-blue mb-4"></div>
          <p className="text-slate-600 font-medium">{isAnalyzing ? 'Analyzing repository codebase...' : 'Loading graph...'}</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-slate-50"
      >
        <Controls className="bg-white border-slate-200 shadow-sm" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />
        
        {stats && (
          <Panel position="top-right" className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm p-4 rounded-lg m-4 min-w-[200px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Repository Stats</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between"><span>Components</span> <span className="font-semibold">{stats.components}</span></div>
              <div className="flex justify-between"><span>Services</span> <span className="font-semibold">{stats.services}</span></div>
              <div className="flex justify-between"><span>Controllers</span> <span className="font-semibold">{stats.controllers}</span></div>
              <div className="flex justify-between"><span>APIs/Routes</span> <span className="font-semibold">{stats.apis}</span></div>
              <div className="flex justify-between"><span>Models</span> <span className="font-semibold">{stats.models}</span></div>
            </div>
            
            <button
              onClick={() => fetchGraph(true)}
              disabled={isAnalyzing}
              className="mt-4 w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw size={12} className={isAnalyzing ? 'animate-spin' : ''} />
              Re-analyze
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function ArchitectureGraph({ repoId }: { repoId: string }) {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg shadow-sm p-1">
        <button
          onClick={() => setShowEnterprise(false)}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${!showEnterprise ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <Box size={14} className="inline-block mr-1.5 mb-0.5" />
          Live Repo Graph
        </button>
        <button
          onClick={() => setShowEnterprise(true)}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${showEnterprise ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <Layers size={14} className="inline-block mr-1.5 mb-0.5" />
          Enterprise Template
        </button>
      </div>

      {showEnterprise ? (
        <EnterpriseArchitecture />
      ) : (
        <ReactFlowProvider>
          <ArchitectureGraphInner repoId={repoId} />
        </ReactFlowProvider>
      )}
    </div>
  );
}
