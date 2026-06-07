import * as React from 'react';
import { Card } from '../ui/Card';
import { Globe, Database, FolderOpen, Archive } from 'lucide-react';

interface QuickActionsPanelProps {
  onOpenLocalhost: () => void;
  onOpenPhpMyAdmin: () => void;
  onOpenHtdocs: () => void;
  onBackup: () => void;
}

export function QuickActionsPanel({
  onOpenLocalhost,
  onOpenPhpMyAdmin,
  onOpenHtdocs,
  onBackup,
}: QuickActionsPanelProps) {
  const actions = [
    { label: 'Localhost', icon: Globe, onClick: onOpenLocalhost },
    { label: 'phpMyAdmin', icon: Database, onClick: onOpenPhpMyAdmin },
    { label: 'Web Root', icon: FolderOpen, onClick: onOpenHtdocs },
    { label: 'Backup', icon: Archive, onClick: onBackup },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 pb-2 border-b border-border-soft">
        <h3 className="font-semibold text-text-primary text-sm">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 flex-1">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-3 bg-card-elevated border border-border-soft rounded-md hover:border-text-secondary transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-electric-blue"
          >
            <action.icon className="w-6 h-6 text-text-secondary group-hover:text-electric-blue transition-colors mb-2" />
            <span className="text-sm font-medium text-text-primary">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
