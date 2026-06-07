import * as React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, actionIcon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-6 shadow-glow-blue animate-pulse-soft">
        <div className="text-electric-blue w-10 h-10">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" className="shadow-glow-blue hover:scale-105 transition-transform">
          {actionIcon && <span className="mr-2">{actionIcon}</span>}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
