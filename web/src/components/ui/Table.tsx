import { ReactNode, TableHTMLAttributes, forwardRef, memo, useMemo } from 'react';

export interface Column<T = unknown> {
  key: string;
  header: string;
  render?: (row: T & unknown, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Helper to create typed columns for Table component.
 * Ensures proper type inference for the render function.
 */
export function createColumns<T>(columns: Column<T>[]): Column<T>[] {
  return columns;
}

interface TablePropsInternal<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: Column<any>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
}

export interface TableProps<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
}

function TableComponent<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos',
  emptyAction,
  striped = false,
  hoverable = true,
  className = '',
  ...props
}: TablePropsInternal<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  const headerRow = useMemo(() => (
    <tr className="border-b border-neutral-200 dark:border-neutral-700">
      {columns.map((col) => (
        <th
          key={col.key}
          scope="col"
          className={`pb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.headerClassName || ''}`}
        >
          {col.header}
        </th>
      ))}
    </tr>
  ), [columns]);

  const rows = useMemo(() => data.map((row, rowIndex) => (
    <tr
      key={keyExtractor(row)}
      className={`${hoverable ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors duration-100' : ''} ${striped && rowIndex % 2 === 1 ? 'bg-neutral-25 dark:bg-neutral-800/30' : ''}`}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`py-4 px-4 text-sm text-neutral-900 dark:text-neutral-100 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
        >
          {col.render ? col.render(row, rowIndex) : String((row as Record<string, unknown>)[col.key] ?? '')}
        </td>
      ))}
    </tr>
  )), [data, columns, keyExtractor, hoverable, striped]);

  return (
    <div className={`table-container ${className}`} {...props}>
      <table className="table">
        <thead>{headerRow}</thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">{rows}</tbody>
      </table>
    </div>
  );
}

const Table = memo(TableComponent) as <T>(props: TablePropsInternal<T>) => React.ReactElement | null;
(Table as any).displayName = 'Table';

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export const TableRow = memo(forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', ...props }, ref) => (
    <tr ref={ref} className={className} {...props}>
      {children}
    </tr>
  )
));

TableRow.displayName = 'TableRow';

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell = memo(forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', align = 'left', ...props }, ref) => (
    <td
      ref={ref}
      className={`py-4 px-4 text-sm text-neutral-900 dark:text-neutral-100 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
));

TableCell.displayName = 'TableCell';

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHeader = memo(forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ children, className = '', align = 'left', ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={`pb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''} ${className}`}
      {...props}
    >
      {children}
    </th>
  )
));

TableHeader.displayName = 'TableHeader';

export { Table };