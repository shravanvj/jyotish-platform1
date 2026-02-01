import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-muted border-border text-foreground',
      success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };

    const icons = {
      default: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <span className="absolute left-4 top-4 text-lg">{icons[variant]}</span>
        <div className="pl-8">{props.children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
