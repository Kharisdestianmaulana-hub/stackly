import * as React from 'react';
import { Card } from '../ui/Card';
import { StatusDot } from '../ui/StatusDot';

interface SystemHealthPanelProps {
  apacheStatus?: string;
  mysqlStatus?: string;
  phpStatus?: string;
  pmaStatus?: string;
  apachePort?: number;
  mysqlPort?: number;
  pmaPort?: number;
}

export function SystemHealthPanel({ apacheStatus, mysqlStatus, phpStatus, pmaStatus, apachePort, mysqlPort, pmaPort }: SystemHealthPanelProps) {
  const getDotStatus = (status?: string) => {
    if (status === 'running' || status === 'ready') return 'ok';
    if (status === 'error') return 'error';
    if (status === 'stopped') return 'stopped';
    return 'warning';
  };

  const healthItems = [
    { label: `Apache (${apachePort || 8080})`, status: getDotStatus(apacheStatus) },
    { label: `MySQL (${mysqlPort || 3307})`, status: getDotStatus(mysqlStatus) },
    { label: 'PHP (8000)', status: getDotStatus(phpStatus) },
    { label: `phpMyAdmin (${pmaPort || 8081})`, status: getDotStatus(pmaStatus) },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 pb-2 border-b border-border-soft flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-sm">System Health</h3>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center space-y-4">
        {healthItems.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <StatusDot status={item.status as any} />
            <span className="text-sm text-text-primary font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
