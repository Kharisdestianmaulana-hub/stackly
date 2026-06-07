import * as React from 'react';
import { Card } from '../ui/Card';
import { Trash2, Pause, ChevronDown } from 'lucide-react';
import type { LogEntry } from '@/types/service';
import { cn } from '@/lib/cn';

interface ServerLogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function ServerLogPanel({ logs, onClear }: ServerLogPanelProps) {
  const getTagColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'apache': return 'text-primary-blue';
      case 'mysql': return 'text-success';
      case 'php': return 'text-[#8B5CF6]'; // purple/blue
      case 'system': return 'text-warning';
      default: return 'text-text-muted';
    }
  };

  return (
    <Card className="flex flex-col h-full bg-log-bg border-border-soft">
      <div className="p-3 border-b border-border-soft flex items-center justify-between bg-card">
        <h3 className="font-semibold text-text-primary text-sm">Server Log</h3>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-2 py-1 text-xs text-text-muted hover:text-text-primary rounded-sm transition-colors">
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
          <button onClick={onClear} className="flex items-center space-x-1 px-2 py-1 text-xs text-text-muted hover:text-danger rounded-sm transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <div className="w-px h-4 bg-border-soft mx-1" />
          <button className="p-1 text-text-muted hover:text-text-primary rounded-sm transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed select-text space-y-1">
        {logs.map((log, idx) => (
          <div key={idx} className="flex hover:bg-card-elevated/50 px-2 py-0.5 rounded-sm -mx-2 transition-colors">
            <span className="text-text-muted w-24 shrink-0">[{log.timestamp}]</span>
            <span className={cn('font-semibold w-20 shrink-0', getTagColor(log.source))}>
              [{log.source}]
            </span>
            <span className="text-text-secondary whitespace-pre-wrap ml-2">
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-text-muted italic">No logs available.</div>
        )}
      </div>
    </Card>
  );
}
