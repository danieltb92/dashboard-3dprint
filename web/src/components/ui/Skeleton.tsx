import { memo } from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = memo(({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 ${className}`} />
));

Skeleton.displayName = 'Skeleton';

const SkeletonRow = memo(() => (
  <div className="flex items-center gap-4 py-3">
    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
    <Skeleton className="h-8 w-8 rounded" />
  </div>
));

SkeletonRow.displayName = 'SkeletonRow';

const SkeletonTable = memo(({ rows = 5 }: { rows?: number }) => (
  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
));

SkeletonTable.displayName = 'SkeletonTable';

export { Skeleton, SkeletonRow, SkeletonTable };
