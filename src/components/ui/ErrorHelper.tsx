import * as React from 'react';
import { Card } from '../ui/Card';
import { AlertCircle, RefreshCcw, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorHelperProps {
  problem: string;
  cause: string;
  fix: string;
  actions: { label: string; onClick: () => void; variant?: 'default' | 'danger' | 'secondary' | 'teal' | 'ghost' }[];
}

export function ErrorHelper({ problem, cause, fix, actions }: ErrorHelperProps) {
  return (
    <Card className="border-danger/50 bg-danger/5 overflow-hidden">
      <div className="p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary text-sm mb-1">{problem}</h4>
          <div className="space-y-1 text-sm mb-4">
            <p className="text-text-secondary"><span className="text-text-muted">Cause:</span> {cause}</p>
            <p className="text-text-secondary"><span className="text-text-muted">Fix:</span> {fix}</p>
          </div>
          <div className="flex items-center space-x-2">
            {actions.map((action, idx) => (
              <Button 
                key={idx} 
                variant={action.variant || 'secondary'} 
                size="sm" 
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
