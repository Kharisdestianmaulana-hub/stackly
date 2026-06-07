import * as React from 'react';
import { Gauge, SlidersHorizontal, Folder, Database, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { StatusDot } from '../ui/StatusDot';
import { useTranslation } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: Gauge },
    { id: 'services', label: t('sidebar.services'), icon: SlidersHorizontal },
    { id: 'projects', label: t('sidebar.projects'), icon: Folder },
    { id: 'db', label: t('sidebar.db'), icon: Database },
    { id: 'logs', label: t('sidebar.logs'), icon: FileText },
  ];

  return (
    <aside className="w-[260px] bg-sidebar flex flex-col border-r border-border-soft flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="h-24 flex items-center px-6 pt-10">
        <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary-blue to-teal flex items-center justify-center">
            <span className="text-white font-bold text-sm">St</span>
          </div>
          <span className="text-text-primary font-bold text-lg tracking-tight">Stackly</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-all duration-180 text-sm outline-none focus-visible:ring-2 focus-visible:ring-electric-blue',
                isActive 
                  ? 'bg-primary-blue text-text-primary shadow-glow-blue' 
                  : 'text-text-secondary hover:bg-card hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={() => onTabChange('settings')}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-all duration-180 text-sm outline-none focus-visible:ring-2 focus-visible:ring-electric-blue text-text-secondary hover:bg-card hover:text-text-primary"
        >
          <Settings className="w-4 h-4" />
          <span>{t('sidebar.settings')}</span>
        </button>
      </div>
    </aside>
  );
}
