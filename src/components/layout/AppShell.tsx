import * as React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-app-bg overflow-hidden text-text-primary rounded-xl" style={{ border: '1px solid #1D314A' }}>
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
