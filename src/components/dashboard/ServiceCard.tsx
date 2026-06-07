import * as React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Play, Square, RotateCcw, Settings, FileText, ExternalLink } from 'lucide-react';
import type { ServiceInfo } from '@/types/service';
import { cn } from '@/lib/cn';

interface ServiceCardProps {
  service: ServiceInfo;
  icon: React.ReactNode;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onConfig?: () => void;
  onLogs?: () => void;
  onOpen?: () => void;
}

export function ServiceCard({
  service,
  icon,
  onStart,
  onStop,
  onRestart,
  onConfig,
  onLogs,
  onOpen,
}: ServiceCardProps) {
  const isRunning = service.status === 'running';
  const isReady = service.status === 'ready';
  const isError = service.status === 'error';

  return (
    <Card className="relative overflow-hidden flex flex-col justify-between">
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-0.5",
          isRunning ? "bg-success shadow-glow-green" : "",
          isReady ? "bg-electric-blue shadow-glow-blue" : "",
          isError ? "bg-danger" : "",
          (!isRunning && !isReady && !isError) ? "bg-border-soft" : ""
        )} 
      />
      
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-md bg-card-elevated border border-border-soft flex items-center justify-center text-text-primary">
            {icon}
          </div>
          <Badge variant={service.status}>{service.status}</Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-1">{service.label}</h3>
        <p className="text-sm text-text-secondary">
          {service.port ? `Port ${service.port}` : service.version ? `v${service.version}` : 'Ready'}
        </p>
      </div>

      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-center space-x-2 mb-2">
          {isRunning ? (
            <Button variant="danger" size="sm" className="flex-1" onClick={onStop}>
              <Square className="w-3.5 h-3.5 mr-1.5" /> Stop
            </Button>
          ) : (
            <Button variant="default" size="sm" className="flex-1" onClick={onStart}>
              <Play className="w-3.5 h-3.5 mr-1.5" /> Start
            </Button>
          )}
          
          {(isRunning || isReady) && onOpen ? (
            <Button variant="teal" size="sm" className="flex-1" onClick={onOpen}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="px-2" onClick={onRestart} title="Restart" disabled={!isRunning && !isReady}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onConfig}>
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Config
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onLogs}>
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Logs
          </Button>
        </div>
      </div>
    </Card>
  );
}
