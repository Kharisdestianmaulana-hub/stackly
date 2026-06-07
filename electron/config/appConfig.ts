import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface AppConfig {
  apachePort: number;
  mysqlPort: number;
  phpmyadminPort: number;
  htdocsPath: string;
  backupPath: string;
  logsPath: string;
  autoStartServices: boolean;
  theme: 'dark' | 'light' | 'system';
  mysqlRootPassword: string;
  appLocked: boolean;
  accentColor: string;
  language: 'en' | 'id';
}

const defaultConfig: AppConfig = {
  apachePort: 8080,
  mysqlPort: 3306,
  phpmyadminPort: 8081,
  htdocsPath: '~/Sites/stackly',
  backupPath: '~/Stackly/backups',
  logsPath: '~/Stackly/logs',
  autoStartServices: false,
  theme: 'dark',
  mysqlRootPassword: '',
  appLocked: false,
  accentColor: 'blue',
  language: 'en'
};

let currentConfig = { ...defaultConfig };
let configPath = '';

try {
  configPath = path.join(app.getPath('userData'), 'stackly-config.json');
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf-8');
    currentConfig = { ...defaultConfig, ...JSON.parse(data) };
  } else {
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
  }
} catch (e) {
  console.error('Failed to load/save config', e);
}

export function getAppConfig(): AppConfig {
  return currentConfig;
}

export function updateAppConfig(newData: Partial<AppConfig>): AppConfig {
  currentConfig = { ...currentConfig, ...newData };
  try {
    if (configPath) {
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Failed to save config', e);
  }
  return currentConfig;
}
