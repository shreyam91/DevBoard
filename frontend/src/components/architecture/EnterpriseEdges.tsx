import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getBezierPath } from '@xyflow/react';

export function AnimatedFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: any) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 24,
  });

  const color = data?.color || '#3b82f6';
  const packetColor = data?.packetColor || color;
  const label = data?.label;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          opacity: 0.6,
          filter: selected ? `drop-shadow(0 0 4px ${color})` : 'none',
        }} 
      />
      {/* Moving Packets / Particles */}
      <circle r="4" fill={packetColor} style={{ filter: `drop-shadow(0 0 3px ${packetColor})` }}>
        <animateMotion dur={data?.speed || "2s"} repeatCount="indefinite" path={edgePath} />
      </circle>
      <circle r="2" fill="#fff" opacity="0.8">
        <animateMotion dur={data?.speed || "2s"} repeatCount="indefinite" path={edgePath} begin="0.1s" />
      </circle>

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="px-2 py-0.5 rounded-full bg-white/90 border shadow-sm text-[9px] font-mono font-bold tracking-wider" style={{ color, borderColor: color }}>
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export function GlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data?.color || '#f97316';
  const label = data?.label;

  return (
    <>
      {/* Glow Layer */}
      <BaseEdge 
        path={edgePath} 
        style={{
          stroke: color,
          strokeWidth: selected ? 8 : 4,
          opacity: selected ? 0.4 : 0.2,
          strokeLinecap: 'round',
          filter: `blur(${selected ? 4 : 2}px)`
        }} 
      />
      {/* Core Layer */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeLinecap: 'round',
        }} 
        className={data?.animated !== false ? 'react-flow__edge-path-animated' : ''}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-mono shadow-md" style={{ boxShadow: `0 0 10px ${color}` }}>
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const enterpriseEdgeTypes = {
  animatedFlowEdge: AnimatedFlowEdge,
  glowingEdge: GlowingEdge,
};
