/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { enterpriseNodeTypes } from './EnterpriseNodes';
import { enterpriseEdgeTypes } from './EnterpriseEdges';
import { generateEnterpriseData } from './EnterpriseData';
import { Loader2, Search, X } from 'lucide-react';

const elk = new ELK();

const getElkLayoutedElements = async (nodes: any[], edges: any[], options: any = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  
  const graph: any = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      ...options
    },
    children: [],
    edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] }))
  };

  const nodeMap = new Map();
  nodes.forEach(n => {
    nodeMap.set(n.id, { 
      id: n.id, 
      width: n.type === 'groupNode' ? (n.data?.width || 300) : (n.type === 'databaseTableNode' ? 224 : 180), 
      height: n.type === 'groupNode' ? (n.data?.height || 200) : (n.type === 'databaseTableNode' ? 150 : 40),
      layoutOptions: n.type === 'groupNode' ? {
        'elk.padding': '[top=50,left=20,bottom=20,right=20]',
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '20',
      } : {}
    });
  });

  nodes.forEach(n => {
    if (n.parentNode && nodeMap.has(n.parentNode)) {
      const parent = nodeMap.get(n.parentNode);
      if (!parent.children) parent.children = [];
      parent.children.push(nodeMap.get(n.id));
    } else {
      graph.children.push(nodeMap.get(n.id));
    }
  });

  const layoutedGraph = await elk.layout(graph);
  const layoutedNodes: any[] = [];
  
  const processLayoutedNodes = (children: any[]) => {
    if (!children) return;
    children.forEach(c => {
      const origNode = nodes.find(n => n.id === c.id);
      if (origNode) {
        layoutedNodes.push({
          ...origNode,
          position: { x: c.x, y: c.y },
          data: {
            ...origNode.data,
            width: c.width,
            height: c.height
          }
        });
      }
      processLayoutedNodes(c.children);
    });
  };
  
  processLayoutedNodes(layoutedGraph.children);
  
  return { nodes: layoutedNodes, edges };
};

export function EnterpriseArchitectureInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const initGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = generateEnterpriseData();
      const layouted = await getElkLayoutedElements(data.nodes, data.edges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    initGraph();
  }, [initGraph]);

  const onNodeClick = useCallback((event: any, node: any) => {
    if (node.type !== 'groupNode') {
      setSelectedNode(node);
    }
  }, []);

  return (
    <div className="w-full h-full bg-slate-50 relative font-sans text-slate-900">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-50/90 backdrop-blur-sm">
          <Loader2 className="animate-spin text-accent-blue mb-4" size={32} />
          <p className="text-slate-600 font-medium">Generating Enterprise Architecture...</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={enterpriseNodeTypes}
        edgeTypes={enterpriseEdgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        className="bg-slate-50"
      >
        <Controls className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden" />
        <MiniMap 
          nodeColor={(n: any) => {
            if (n.type === 'groupNode') return '#e2e8f0';
            if (n.data?.color === 'blue') return '#60a5fa';
            if (n.data?.color === 'green') return '#34d399';
            if (n.data?.color === 'purple') return '#c084fc';
            if (n.data?.color === 'orange') return '#fb923c';
            if (n.data?.color === 'red') return '#fb7185';
            return '#cbd5e1';
          }}
          className="bg-white border border-slate-200 rounded-lg shadow-sm"
          maskColor="rgba(248, 250, 252, 0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />

        {/* Toolbar Panel */}
        <Panel position="top-left" className="m-4">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-lg p-2 flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue w-48"
              />
            </div>
            <button className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-sm hover:bg-slate-800 transition-colors">
              Auto Layout
            </button>
          </div>
        </Panel>

        {/* Detail Side Panel */}
        {selectedNode && (
          <Panel position="top-right" className="m-4 max-w-sm w-full z-40 h-[calc(100vh-8rem)]">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                  Node Details
                </h3>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedNode.data.label}</h2>
                  <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                    {selectedNode.data.subtitle || 'System Component'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">Responsibilities</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Handles core business logic and routing for this domain. Extends shared utilities and integrates with configured databases.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">Source Code</h4>
                    <div className="bg-slate-900 text-slate-300 text-xs font-mono p-3 rounded-lg flex items-center gap-2">
                      <FileCode size={14} className="text-accent-blue" />
                      src/app/{selectedNode.data.label.toLowerCase().replace(/\s+/g, '-')}/index.ts
                    </div>
                  </div>

                  {selectedNode.type === 'databaseTableNode' && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">Schema Columns</h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                        {selectedNode.data.columns.map((c: any, i: number) => (
                          <div key={i} className="px-3 py-2 border-b border-slate-100 last:border-0 flex justify-between text-xs font-mono">
                            <span className="text-slate-700 font-bold">{c.name} {c.isPrimary && '🔑'}</span>
                            <span className="text-slate-500">{c.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function EnterpriseArchitecture() {
  return (
    <ReactFlowProvider>
      <EnterpriseArchitectureInner />
    </ReactFlowProvider>
  );
}
