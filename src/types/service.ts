export type ServiceName = 'apache' | 'mysql' | 'php' | 'phpmyadmin';

export type ServiceStatus = 
  | 'running'
  | 'stopped'
  | 'starting'
  | 'stopping'
  | 'ready'
  | 'error'
  | 'missing';

export interface ServiceInfo {
  name: ServiceName;
  label: string;
  status: ServiceStatus;
  port?: number;
  version?: string;
  executablePath?: string;
  configPath?: string;
  logPath?: string;
  lastStartedAt?: string;
  errorMessage?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
