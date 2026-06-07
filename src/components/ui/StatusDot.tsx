import * as React from 'react';
import { cn } from '@/lib/cn';

interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'ok' | 'warning' | 'error' | 'stopped';
}

export function StatusDot({ status, className, ...props }: StatusDotProps) {
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        {
          'bg-success shadow-glow-green': status === 'ok',
          'bg-warning': status === 'warning',
          'bg-danger': status === 'error',
          'bg-text-disabled': status === 'stopped',
        },
        className
      )}
      {...props}
    />
  );
}
