import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        running: 'bg-success/15 text-success',
        ready: 'bg-electric-blue/15 text-electric-blue',
        stopped: 'bg-text-disabled/15 text-text-disabled',
        error: 'bg-danger/15 text-danger',
        warning: 'bg-warning/15 text-warning',
        starting: 'bg-electric-blue/15 text-electric-blue animate-pulse',
        stopping: 'bg-text-disabled/15 text-text-disabled animate-pulse',
        missing: 'bg-warning/15 text-warning',
      },
    },
    defaultVariants: {
      variant: 'stopped',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
