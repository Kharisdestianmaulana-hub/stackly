import * as React from 'react';
import { Server, Database, Code2, Play, Square, RotateCcw, Settings, FileText, ExternalLink, HardDrive } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { ServiceInfo } from '@/types/service';
import { cn } from '@/lib/cn';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ServiceRowProps {
  service: ServiceInfo;
  icon: React.ReactNode;
  description: string;
  pathInfo: string;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onConfig?: () => void;
  onLogs?: () => void;
  onOpen?: () => void;
}

function ServiceRow({
  service,
  icon,
  description,
  pathInfo,
  onStart,
  onStop,
  onRestart,
  onConfig,
  onLogs,
  onOpen,
}: ServiceRowProps) {
  const { t } = useTranslation();
  const isRunning = service.status === 'running';
  const isReady = service.status === 'ready';
  const isError = service.status === 'error';

  return (
    <Card className="p-0 overflow-hidden mb-4">
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Status & Identity */}
        <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border-soft flex items-start space-x-4 bg-sidebar">
          <div className="w-12 h-12 rounded-lg bg-card border border-border-soft flex items-center justify-center text-electric-blue shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-semibold text-text-primary">{service.label}</h3>
              <Badge variant={service.status}>{service.status}</Badge>
            </div>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        </div>

        {/* Middle: Details & Paths */}
        <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border-soft flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <span className="text-text-muted w-24">Port / Version:</span>
              <span className="text-text-primary font-mono">{service.port ? service.port : `v${service.version || 'Latest'}`}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-text-muted w-24">Location:</span>
              <span className="text-text-primary font-mono text-xs truncate" title={pathInfo}>{pathInfo}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="p-6 lg:w-1/3 flex flex-col justify-center space-y-3 bg-card">
          <div className="flex items-center space-x-2">
            {isRunning ? (
              <Button variant="danger" className="flex-1" onClick={onStop}>
                <Square className="w-4 h-4 mr-2" /> {t('services.stop')}
              </Button>
            ) : (
              <Button variant="default" className="flex-1" onClick={onStart}>
                <Play className="w-4 h-4 mr-2" /> {t('services.start')}
              </Button>
            )}
            
            {(isRunning || isReady) && onOpen ? (
              <Button variant="teal" className="flex-1" onClick={onOpen}>
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </Button>
            ) : (
              <Button variant="secondary" className="px-3" onClick={onRestart} title="Restart" disabled={!isRunning && !isReady}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={onConfig}>
              <Settings className="w-4 h-4 mr-2" /> {t('services.config')}
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={onLogs}>
              <FileText className="w-4 h-4 mr-2" /> {t('services.logs')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Services() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [apacheInfo, setApacheInfo] = React.useState<ServiceInfo>({ name: 'apache', label: 'Apache', status: 'stopped', port: 8080 });
  const [mysqlInfo, setMysqlInfo] = React.useState<ServiceInfo>({ name: 'mysql', label: 'MySQL', status: 'stopped', port: 3307 });
  const [phpInfo, setPhpInfo] = React.useState<ServiceInfo>({ name: 'php', label: 'PHP', status: 'ready', version: '8.2' });
  const [phpMyAdminInfo, setPhpMyAdminInfo] = React.useState<ServiceInfo>({ name: 'phpmyadmin', label: 'phpMyAdmin', status: 'ready' });

  React.useEffect(() => {
    const fetchStatus = async () => {
      if (!window.stackly) return;
      const status = await window.stackly.services.getStatus();
      setApacheInfo(prev => ({ ...prev, status: status.apache.status }));
      setMysqlInfo(prev => ({ ...prev, status: status.mysql.status }));
      setPhpInfo(prev => ({ ...prev, status: status.php.status }));
      setPhpMyAdminInfo(prev => ({ ...prev, status: status.phpmyadmin.status }));
    };

    fetchStatus();
    
    // Fallback polling for things we don't catch with events
    const interval = setInterval(fetchStatus, 5000);

    // Listen for real-time status changes
    window.stackly.services.onServiceStatusChanged((data: any) => {
      const setters: Record<string, React.Dispatch<React.SetStateAction<ServiceInfo>>> = {
        apache: setApacheInfo,
        mysql: setMysqlInfo,
        php: setPhpInfo,
        phpmyadmin: setPhpMyAdminInfo
      };
      const setter = setters[data.serviceName];
      if (setter) {
        setter(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => clearInterval(interval);
  }, []);

  const handleStart = async (service: string) => window.stackly?.services.start(service);
  const handleStop = async (service: string) => window.stackly?.services.stop(service);
  const handleRestart = async (service: string) => window.stackly?.services.restart(service);
  
  const handleForceKill = async () => {
    const isConfirmed = await confirm({
      title: t('services.forceKillTitle'),
      message: t('services.forceKillDesc'),
      isDanger: true,
      confirmLabel: t('services.forceKillLabel'),
    });
    
    if (isConfirmed) {
      toast.loading(t('common.loading'), { id: 'forceKill' });
      await window.stackly.services.forceKillZombies();
      toast.success(t('services.forceKillSuccess'), { id: 'forceKill' });
    }
  };

  const openConfig = (service: string) => window.stackly?.paths.openConfig(service);
  const openLogs = () => window.stackly?.paths.openLogs();

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{t('services.title')}</h1>
          <p className="text-text-secondary">{t('services.description')}</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleForceKill}>
          <AlertTriangle className="w-4 h-4 mr-2" /> {t('services.forceKill')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ServiceRow
          service={apacheInfo}
          icon={<Server className="w-6 h-6" />}
          description={t('services.apacheDesc')}
          pathInfo="/runtime/apache/bin/httpd"
          onStart={() => handleStart('apache')}
          onStop={() => handleStop('apache')}
          onRestart={() => handleRestart('apache')}
          onConfig={() => openConfig('apache')}
          onLogs={openLogs}
          onOpen={() => window.stackly?.browser.openLocalhost()}
        />
        
        <ServiceRow
          service={mysqlInfo}
          icon={<Database className="w-6 h-6" />}
          description={t('services.mysqlDesc')}
          pathInfo="/runtime/mysql/bin/mysqld"
          onStart={() => handleStart('mysql')}
          onStop={() => handleStop('mysql')}
          onRestart={() => handleRestart('mysql')}
          onConfig={() => openConfig('mysql')}
          onLogs={openLogs}
        />

        <ServiceRow
          service={phpInfo}
          icon={<Code2 className="w-6 h-6" />}
          description={t('services.phpDesc')}
          pathInfo="/runtime/php/bin/php"
          onStart={() => handleStart('php')}
          onStop={() => handleStop('php')}
          onRestart={() => handleRestart('php')}
          onConfig={() => openConfig('php')}
          onLogs={openLogs}
        />

        <ServiceRow
          service={phpMyAdminInfo}
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          }
          description={t('services.pmaDesc')}
          pathInfo="/htdocs/phpmyadmin"
          onStart={() => handleStart('phpmyadmin')}
          onStop={() => handleStop('phpmyadmin')}
          onRestart={() => handleRestart('phpmyadmin')}
          onConfig={() => openConfig('phpmyadmin')}
          onLogs={openLogs}
          onOpen={() => window.stackly?.browser.openPhpMyAdmin()}
        />
      </div>
    </div>
  );
}
