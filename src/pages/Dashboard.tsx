import * as React from 'react';
import { ServiceCard } from '../components/dashboard/ServiceCard';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';
import { SystemHealthPanel } from '../components/dashboard/SystemHealthPanel';
import { RecentProjectsPanel } from '../components/dashboard/RecentProjectsPanel';
import { ServerLogPanel } from '../components/dashboard/ServerLogPanel';
import { Server, Database, Code2 } from 'lucide-react';
import type { ServiceInfo, LogEntry } from '@/types/service';
import { useTranslation } from '../contexts/LanguageContext';

const appStartTime = Date.now();

export function Dashboard() {
  const { t } = useTranslation();
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [uptime, setUptime] = React.useState(0);
  const [apacheInfo, setApacheInfo] = React.useState<ServiceInfo>({ name: 'apache', label: 'Apache', status: 'stopped', port: 8080 });
  const [mysqlInfo, setMysqlInfo] = React.useState<ServiceInfo>({ name: 'mysql', label: 'MySQL', status: 'stopped', port: 3307 });
  const [phpInfo, setPhpInfo] = React.useState<ServiceInfo>({ name: 'php', label: 'PHP', status: 'ready', version: '8.2' });
  const [phpMyAdminInfo, setPhpMyAdminInfo] = React.useState<ServiceInfo>({ name: 'phpmyadmin', label: 'phpMyAdmin', status: 'ready', port: 8081 });

  React.useEffect(() => {
    const fetchStatus = async () => {
      if (!window.stackly) return;
      const status = await window.stackly.services.getStatus();
      setApacheInfo(prev => ({ ...prev, status: status.apache.status, port: status.apache.port }));
      setMysqlInfo(prev => ({ ...prev, status: status.mysql.status, port: status.mysql.port }));
      setPhpInfo(prev => ({ ...prev, status: status.php.status }));
      setPhpMyAdminInfo(prev => ({ ...prev, status: status.phpmyadmin.status, port: status.phpmyadmin.port }));
    };

    const fetchLogs = async () => {
      if (!window.stackly) return;
      const newLogs = await window.stackly.logs.get();
      setLogs(newLogs);
    };

    fetchStatus();
    fetchLogs();
    
    const updateUptime = () => {
      setUptime(Math.floor((Date.now() - appStartTime) / 1000));
    };
    updateUptime();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 2000);

    const uptimeInterval = setInterval(updateUptime, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleStart = async (service: string) => {
    await window.stackly?.services.start(service);
  };

  const handleStop = async (service: string) => {
    await window.stackly?.services.stop(service);
  };

  const handleRestart = async (service: string) => {
    await window.stackly?.services.restart(service);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Server Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        <ServiceCard 
          service={apacheInfo} 
          icon={<Server className="w-5 h-5 text-electric-blue" />} 
          onStart={() => handleStart('apache')}
          onStop={() => handleStop('apache')}
          onRestart={() => handleRestart('apache')}
        />
        <ServiceCard 
          service={mysqlInfo} 
          icon={<Database className="w-5 h-5 text-electric-blue" />} 
          onStart={() => handleStart('mysql')}
          onStop={() => handleStop('mysql')}
          onRestart={() => handleRestart('mysql')}
        />
        <ServiceCard 
          service={phpInfo} 
          icon={<Code2 className="w-5 h-5 text-electric-blue" />} 
          onStart={() => handleStart('php')}
          onStop={() => handleStop('php')}
          onRestart={() => handleRestart('php')}
        />
        <ServiceCard 
          service={phpMyAdminInfo} 
          icon={
            <svg className="w-5 h-5 text-electric-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          } 
          onStart={() => handleStart('phpmyadmin')}
          onStop={() => handleStop('phpmyadmin')}
          onRestart={() => handleRestart('phpmyadmin')}
          onOpen={() => window.stackly?.browser.openPhpMyAdmin()}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 shrink-0 min-h-[220px]">
        <QuickActionsPanel 
          onOpenLocalhost={() => window.stackly?.browser.openLocalhost()} 
          onOpenPhpMyAdmin={() => window.stackly?.browser.openPhpMyAdmin()} 
          onOpenHtdocs={() => window.stackly?.paths.openHtdocs()} 
          onBackup={() => {}} 
        />
        <SystemHealthPanel 
          apacheStatus={apacheInfo.status}
          mysqlStatus={mysqlInfo.status}
          phpStatus={phpInfo.status}
          pmaStatus={phpMyAdminInfo.status}
          apachePort={apacheInfo.port}
          mysqlPort={mysqlInfo.port}
          pmaPort={phpMyAdminInfo.port}
        />
        <RecentProjectsPanel />
      </div>

      <div className="flex-1 min-h-[200px]">
        <ServerLogPanel logs={logs} onClear={() => window.stackly?.logs.clear()} />
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted shrink-0 pt-2">
        <div className="flex items-center space-x-2">
          <span>Uptime: {formatUptime(uptime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>PHP 8.2 | MySQL 8.0 | Apache 2.4</span>
        </div>
      </div>
    </div>
  );
}
