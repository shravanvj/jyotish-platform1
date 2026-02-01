import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div ref={ref} className={cn('relative', sizes[size], className)} {...props}>
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-md bg-muted',
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Preset skeleton components
const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
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

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('card-vedic p-4 space-y-4', className)}>
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn('aspect-square', className)}>
    <Skeleton className="h-full w-full rounded-lg" />
  </div>
);

// Loading overlay
interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  text?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ isLoading, text, children, className, ...props }, ref) => {
    if (!isLoading) return <>{children}</>;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Spinner size="lg" />
          {text && (
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          )}
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

export {
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonChart,
  LoadingOverlay,
};
