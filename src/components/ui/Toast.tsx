import * as React from 'react';
import { cn } from '@/lib/cn';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className={cn(
        "flex items-center space-x-2 px-4 py-3 rounded-md border shadow-lg max-w-sm",
        type === 'success' ? "bg-card border-success/30 text-success" : "",
        type === 'error' ? "bg-card border-danger/30 text-danger" : "",
        type === 'info' ? "bg-card border-electric-blue/30 text-electric-blue" : ""
      )}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
        {type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
        {type === 'info' && <Info className="w-5 h-5 shrink-0" />}
        <span className="text-sm font-medium text-text-primary">{message}</span>
      </div>
    </div>
  );
}
