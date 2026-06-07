import * as React from 'react';
import { Terminal, Filter, Search, FileText, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { LogEntry } from '@/types/service';
import { cn } from '@/lib/cn';
import { useTranslation } from '../contexts/LanguageContext';

export function Logs() {
  const { t } = useTranslation();
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [filterService, setFilterService] = React.useState<string>('all');
  const [filterLevel, setFilterLevel] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchLogs = React.useCallback(async () => {
    if (window.stackly?.logs) {
      const currentLogs = await window.stackly.logs.get();
      setLogs(currentLogs);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
    
    // Auto-refresh logs every 1 second
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Auto-scroll to bottom when new logs arrive (if user hasn't scrolled up)
  React.useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isScrolledToBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 50;
      if (isScrolledToBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [logs]);

  const handleClearLogs = async () => {
    if (window.stackly?.logs) {
      await window.stackly.logs.clear();
      setLogs([]);
    }
  };

  const handleCopyLogs = () => {
    const logText = filteredLogs.map(l => `[${l.timestamp}] [${l.source}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openRawLog = (service: string) => {
    window.stackly?.paths.openRawLog(service);
  };

  const filteredLogs = logs.filter(log => {
    if (filterService !== 'all' && log.source.toLowerCase() !== filterService) return false;
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{t('logs.title')}</h1>
          <p className="text-text-secondary">{t('logs.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => openRawLog('apache')} title="Buka apache_error.log">
            <FileText className="w-4 h-4 mr-2" /> Apache Log
          </Button>
          <Button variant="secondary" onClick={() => openRawLog('php')} title="Buka php_error.log">
            <FileText className="w-4 h-4 mr-2" /> PHP Log
          </Button>
          <Button variant="secondary" onClick={() => openRawLog('mysql')} title="Buka folder log MySQL">
            <FileText className="w-4 h-4 mr-2" /> MySQL Log
          </Button>
        </div>
      </div>

      <div className="bg-card-elevated border border-border-soft rounded-t-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t('logs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input border border-border-strong rounded-md pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-2 bg-input border border-border-strong rounded-md p-1">
            <Filter className="w-4 h-4 text-text-muted ml-2 mr-1" />
            <select 
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="bg-transparent text-sm text-text-primary py-1 pr-2 outline-none cursor-pointer"
            >
              <option value="all">{t('logs.allServices')}</option>
              <option value="apache">Apache</option>
              <option value="mysql">MySQL</option>
              <option value="php">PHP</option>
              <option value="phpmyadmin">phpMyAdmin</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-input border border-border-strong rounded-md p-1">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-sm text-text-primary py-1 px-2 outline-none cursor-pointer"
            >
              <option value="all">{t('logs.allLevels')}</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <Button variant="ghost" size="sm" onClick={handleCopyLogs}>
            {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? t('common.copied') : t('logs.copyAll')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearLogs} className="text-danger hover:bg-danger/10">
            <Trash2 className="w-4 h-4 mr-2" /> {t('logs.clear')}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-[#0c111a] border border-t-0 border-border-soft rounded-b-xl overflow-hidden flex flex-col relative font-mono text-sm shadow-inner">
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <Terminal className="w-12 h-12 mb-3 opacity-20" />
            <p>{t('logs.noLogsFound')}</p>
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar"
          >
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex hover:bg-white/5 px-2 py-0.5 rounded transition-colors group">
                <span className="text-text-muted w-[72px] shrink-0">{log.timestamp}</span>
                <span className="w-24 shrink-0 text-text-secondary">[{log.source}]</span>
                <span className={cn(
                  "w-16 shrink-0 font-medium",
                  log.level === 'error' ? "text-danger" : 
                  log.level === 'warn' ? "text-warning" : "text-electric-blue"
                )}>
                  {log.level.toUpperCase()}
                </span>
                <span className={cn(
                  "break-all",
                  log.level === 'error' ? "text-danger/90" : 
                  log.level === 'warn' ? "text-warning/90" : "text-text-primary"
                )}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
