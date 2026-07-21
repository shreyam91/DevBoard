'use client';

import React, { useEffect, useRef, useState } from 'react';

export type Category = 'database' | 'infra' | 'api' | 'architecture' | 'tooling';
export type Source = 'pr' | 'archaeology' | 'manual' | 'questionnaire';

export interface TimelineDecision {
  id: string;
  title: string;
  rationale: string;
  category: Category;
  source: Source;
  pr_url?: string | null;
  pr_number?: number | null;
  confirmed_by_user: boolean;
  created_at: string;
  has_conflict: boolean;
  conflict_pr_number?: number;
}

interface Props {
  decisions: TimelineDecision[];
  selectedCategory: Category | 'all';
  onDecisionClick: (id: string) => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  database: '#7F77DD',
  infra: '#1D9E75',
  api: '#BA7517',
  architecture: '#378ADD',
  tooling: '#888780',
};

export default function DecisionTimeline({ decisions, selectedCategory, onDecisionClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: TimelineDecision | null;
  }>({ visible: false, x: 0, y: 0, data: null });

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 320
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main D3 logic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || decisions.length === 0) return;

    let isMounted = true;

    import('d3').then(d3 => {
      if (!isMounted) return;

      const svg = d3.select(svgRef.current as SVGSVGElement);
      svg.selectAll('*').remove(); // Clear on re-render

      // Calculate width and ensure it breathes
      const minWidth = decisions.length * 120;
      const width = Math.max(dimensions.width, minWidth);
      const height = dimensions.height;
      const padding = 60;
      const spineY = 160;

      svg
        .attr('width', width)
        .attr('height', height)
        .style('overflow', 'hidden'); // Panning happens inside via transform

      // Create main zoomable group
      const g = svg.append('g');

      // Add background rect to catch zoom/pan events
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all');

      // Date parsing and scales
      const parsedData = decisions.map(d => ({
        ...d,
        date: new Date(d.created_at)
      }));

      const xDomain = d3.extent(parsedData, d => d.date) as [Date, Date];
      
      // Add padding to dates (10% on each side)
      if (xDomain[0] && xDomain[1]) {
        const timePadding = (xDomain[1].getTime() - xDomain[0].getTime()) * 0.1;
        const padAmount = timePadding === 0 ? 30 * 24 * 60 * 60 * 1000 : timePadding;
        xDomain[0] = new Date(xDomain[0].getTime() - padAmount);
        xDomain[1] = new Date(xDomain[1].getTime() + padAmount);
      } else {
        xDomain[0] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        xDomain[1] = new Date();
      }

      const x = d3.scaleTime()
        .domain(xDomain)
        .range([padding, width - padding]);

      // X Axis (Tick marks and month labels)
      const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat((d) => d3.timeFormat("%b %Y")(d as Date))
        .tickSize(0); // We'll draw custom ticks

      const xAxisGroup = g.append('g')
        .attr('transform', `translate(0, ${spineY})`)
        .call(xAxis);

      // Customize axis styles
      xAxisGroup.select('.domain').remove(); // Remove default axis line
      
      // Custom spine line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', spineY)
        .attr('y2', spineY)
        .attr('stroke', 'rgba(0,0,0,0.1)')
        .attr('stroke-width', 1);

      // Custom ticks
      xAxisGroup.selectAll('.tick text')
        .attr('y', 14)
        .style('fill', 'rgba(0,0,0,0.45)')
        .style('font-size', '10px')
        .style('font-family', 'Inter, sans-serif');

      xAxisGroup.selectAll('.tick')
        .append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -4)
        .attr('y2', 4)
        .attr('stroke', 'rgba(0,0,0,0.1)')
        .attr('stroke-width', 1);

      // Nodes group
      const nodes = g.selectAll('.node')
        .data(parsedData)
        .enter()
        .append('g')
        .attr('class', 'node cursor-pointer')
        // Fade out non-matching categories
        .style('opacity', d => (selectedCategory === 'all' || d.category === selectedCategory) ? 1 : 0.1)
        .style('transition', 'opacity 300ms ease')
        .attr('transform', (d, i) => {
          const cx = x(d.date);
          const cy = i % 2 === 0 ? 220 : 100;
          return `translate(${cx}, ${cy})`;
        });

      // Entry animation
      nodes
        .attr('transform', (d, i) => {
          const cx = x(d.date);
          const cy = i % 2 === 0 ? 220 : 100;
          return `translate(${cx}, ${cy}) scale(0)`;
        })
        .transition()
        .delay((d, i) => i * 30)
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('transform', (d, i) => {
          const cx = x(d.date);
          const cy = i % 2 === 0 ? 220 : 100;
          return `translate(${cx}, ${cy}) scale(1)`;
        });

      // Connector lines
      nodes.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', (d, i) => i % 2 === 0 ? (spineY - 220) : (spineY - 100))
        .attr('stroke', 'rgba(0,0,0,0.1)')
        .attr('stroke-width', 1);

      // Conflict Ring
      nodes.filter(d => d.has_conflict)
        .append('circle')
        .attr('r', 10)
        .attr('fill', 'none')
        .attr('stroke', '#E24B4A')
        .attr('stroke-width', 2);

      // Main dot
      nodes.append('circle')
        .attr('r', 7)
        .attr('fill', d => CATEGORY_COLORS[d.category] || '#ccc')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', d => (!d.confirmed_by_user && (d.source === 'pr' || d.source === 'archaeology')) ? '2,2' : 'none')
        .style('opacity', d => (!d.confirmed_by_user && (d.source === 'pr' || d.source === 'archaeology')) ? 0.6 : 1);

      // Node label
      nodes.append('text')
        .attr('y', (d, i) => i % 2 === 0 ? -15 : 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .style('font-family', 'Inter, sans-serif')
        .style('fill', d => CATEGORY_COLORS[d.category] || '#ccc')
        // Max width simulation via truncation (basic implementation)
        .text(d => d.title.length > 20 ? d.title.substring(0, 18) + '...' : d.title);

      // Interactions
      nodes
        .on('mouseover', function(event, d) {
          // Hover scale effect
          d3.select(this).select('circle')
            .transition().duration(150)
            .attr('transform', 'scale(1.4)');

          // Show tooltip
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltip({
              visible: true,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              data: d
            });
          }
        })
        .on('mouseout', function() {
          d3.select(this).select('circle')
            .transition().duration(150)
            .attr('transform', 'scale(1)');

          setTooltip(prev => ({ ...prev, visible: false }));
        })
        .on('click', (event, d) => {
          onDecisionClick(d.id);
        });

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => {
          // Only zoom/pan the X axis
          const newX = event.transform.rescaleX(x);
          
          g.selectAll<SVGGElement, typeof parsedData[0]>('.node')
            .attr('transform', (d, i) => {
              const cx = newX(d.date);
              const cy = i % 2 === 0 ? 220 : 100;
              return `translate(${cx}, ${cy})`;
            });

          xAxisGroup.call(
            d3.axisBottom(newX)
              .ticks(d3.timeMonth.every(1))
              .tickFormat((d) => d3.timeFormat("%b %Y")(d as Date))
              .tickSize(0)
          );
          
          xAxisGroup.select('.domain').remove();
          
          xAxisGroup.selectAll('.tick text')
            .attr('y', 14)
            .style('fill', 'rgba(0,0,0,0.45)')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif');

          xAxisGroup.selectAll('.tick')
            .selectAll('line').remove();
            
          xAxisGroup.selectAll('.tick')
            .append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', -4)
            .attr('y2', 4)
            .attr('stroke', 'rgba(0,0,0,0.1)')
            .attr('stroke-width', 1);
        });

      svg.call(zoom);

    });

    return () => {
      isMounted = false;
    };
  }, [dimensions, decisions, selectedCategory, onDecisionClick]);

  return (
    <div ref={containerRef} className="relative w-full h-[320px]">
      
      {decisions.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] text-[rgba(0,0,0,0.45)]">
            No decisions yet. Merge a PR to get started.
          </span>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full" />
      )}

      {/* HTML Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div 
          className="absolute z-50 bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] shadow-lg p-3 w-[240px] pointer-events-none transform -translate-x-1/2 -translate-y-[110%]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span 
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: CATEGORY_COLORS[tooltip.data.category] }}
            >
              {tooltip.data.category}
            </span>
          </div>
          <h4 className="text-[12px] font-medium text-neutral-900 leading-tight mb-1">
            {tooltip.data.title}
          </h4>
          <div className="text-[10px] text-[rgba(0,0,0,0.45)] mb-2">
            {new Date(tooltip.data.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <p className="text-[11px] text-[rgba(0,0,0,0.6)] leading-[1.5] line-clamp-3">
            {tooltip.data.rationale}
          </p>
          
          {tooltip.data.has_conflict && (
            <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] flex items-center gap-1.5 text-[#A32D2D]">
              <i className="ti ti-alert-triangle text-[13px]"></i>
              <span className="text-[11px] font-medium">Conflict with PR #{tooltip.data.conflict_pr_number || 'Unknown'}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
