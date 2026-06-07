export interface AppConfig {
  apachePort: number;
  mysqlPort: number;
  phpmyadminPort: number;
  htdocsPath: string;
  backupPath: string;
  logsPath: string;
  autoStartServices: boolean;
  theme: 'dark' | 'light' | 'system';
}
