import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
}

/** Lightweight, consistent data table used across DevHub screens. */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  onRowClick?: (r: T) => void;
  empty?: ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="card">{empty ?? <div className="p-8 text-center text-[13px] text-[var(--text-muted)]">No rows to display.</div>}</div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="table-th">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('hover:bg-[var(--surface-hover)] transition-colors', onRowClick && 'cursor-pointer')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('table-td align-top', c.className)}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Horizontal chip row for filtering; caller owns the active state. */
export function FilterBar<T extends string>({ options, active, onChange }: {
  options: { value: T; label: string; count?: number }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-7 px-2.5 rounded-md text-[12.5px] font-medium transition-colors',
            active === o.value
              ? 'bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-transparent'
          )}
        >
          {o.label}
          {typeof o.count === 'number' && <span className="ml-1 text-[11px] text-[var(--text-faint)]">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}