import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

export function SkeletonText({ className, lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('card-vedic p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('aspect-square relative', className)}>
      <Skeleton className="absolute inset-0 rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBirthChart() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form skeleton */}
      <div className="card-vedic p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Chart skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <SkeletonChart />
      </div>
    </div>
  );
}

export function SkeletonPanchang() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
