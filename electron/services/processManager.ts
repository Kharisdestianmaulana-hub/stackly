import { spawn, ChildProcess, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { app, BrowserWindow } from 'electron';
import { ServiceName, ServiceStatus } from '../../src/types/service';
import { addLog } from './logManager';
import { checkPort } from './portChecker';
import { getAppConfig } from '../config/appConfig';
import { updateApachePort, updateMysqlPort } from './configEditor';

const processes: Record<ServiceName, { status: ServiceStatus, process?: ChildProcess }> = {
  apache: { status: 'stopped' },
  mysql: { status: 'stopped' },
  php: { status: 'stopped' }, // PHP runs via Apache for now
  phpmyadmin: { status: 'stopped' }
};

function setStatus(serviceName: ServiceName, status: ServiceStatus) {
  processes[serviceName].status = status;
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('services:status-changed', { serviceName, status });
  }
}

const basePath = app.getAppPath();

// Background Health Poller
setInterval(async () => {
  const config = getAppConfig();
  
  const checkService = async (serviceName: ServiceName, port: number) => {
    if (processes[serviceName].status === 'running') {
      const isFree = await checkPort(port);
      if (isFree) {
        // Port became free while it was supposed to be running -> died!
        setStatus(serviceName, 'stopped');
        addLog(serviceName, 'error', `Service stopped unexpectedly (port ${port} is no longer in use).`);
      }
    }
  };

  await checkService('apache', config.apachePort);
  await checkService('mysql', config.mysqlPort);
  await checkService('php', 8000); // Internal API port
  await checkService('phpmyadmin', config.phpmyadminPort);
}, 5000);

export function getResolvedHtdocsPath(): string {
  const config = getAppConfig();
  let htdocs = config.htdocsPath || '~/Sites/stackly';
  if (htdocs.startsWith('~/')) {
    htdocs = path.join(os.homedir(), htdocs.slice(2));
  }
  
  if (!fs.existsSync(htdocs)) {
    try {
      fs.mkdirSync(htdocs, { recursive: true });
      // Copy default index files if we just created the directory
      const defaultHtdocs = path.join(basePath, 'htdocs');
      if (fs.existsSync(path.join(defaultHtdocs, 'index.php'))) {
        fs.copyFileSync(path.join(defaultHtdocs, 'index.php'), path.join(htdocs, 'index.php'));
      }
      if (fs.existsSync(path.join(defaultHtdocs, 'phpinfo.php'))) {
        fs.copyFileSync(path.join(defaultHtdocs, 'phpinfo.php'), path.join(htdocs, 'phpinfo.php'));
      }
      if (fs.existsSync(path.join(defaultHtdocs, 'favicon.ico'))) {
        fs.copyFileSync(path.join(defaultHtdocs, 'favicon.ico'), path.join(htdocs, 'favicon.ico'));
      }
    } catch (e) {
      console.error('Failed to create htdocs directory:', e);
    }
  }
  return htdocs;
}

export async function spawnService(serviceName: ServiceName, args: string[]): Promise<boolean> {
  if (processes[serviceName]?.status === 'running' || processes[serviceName]?.status === 'starting') {
    return true;
  }

  setStatus(serviceName, 'starting');

  let command = '';
  let commandArgs: string[] = [];
  const config = getAppConfig();

  if (serviceName === 'apache') {
    const isPortFree = await checkPort(config.apachePort);
    if (!isPortFree) {
      setStatus(serviceName, 'error');
      addLog('Apache', 'error', `Port conflict: Port ${config.apachePort} is already in use by another application.`);
      return false;
    }
    updateApachePort(config.apachePort);
    const configDir = path.join(app.getPath('userData'), 'config');
    command = path.join(basePath, 'runtime', 'apache', 'bin', 'httpd');
    commandArgs = ['-D', 'FOREGROUND', '-C', `Define STACKLY_DOCROOT ${getResolvedHtdocsPath()}`, '-f', path.join(configDir, 'apache', 'httpd.conf')];
  } else if (serviceName === 'mysql') {
    const isPortFree = await checkPort(config.mysqlPort);
    if (!isPortFree) {
      setStatus(serviceName, 'error');
      addLog('MySQL', 'error', `Port conflict: Port ${config.mysqlPort} is already in use by another application.`);
      return false;
    }
    updateMysqlPort(config.mysqlPort);
    const configDir = path.join(app.getPath('userData'), 'config');
    const mysqlDataDir = path.join(app.getPath('userData'), 'mysql_data');
    command = path.join(basePath, 'runtime', 'mysql', 'bin', 'mysqld');
    commandArgs = ['--defaults-file=' + path.join(configDir, 'mysql', 'my.cnf'), `--datadir=${mysqlDataDir}`];
  } else if (serviceName === 'php') {
    const isPortFree = await checkPort(8000);
    if (!isPortFree) {
      setStatus(serviceName, 'error');
      addLog('PHP', 'error', 'Port 8000 is already in use.');
      return false;
    }
    command = path.join(basePath, 'runtime', 'php', 'bin', 'php');
    const configDir = path.join(app.getPath('userData'), 'config');
    commandArgs = ['-S', '127.0.0.1:8000', '-t', getResolvedHtdocsPath(), '-c', path.join(configDir, 'php', 'php.ini')];
  } else if (serviceName === 'phpmyadmin') {
    const isPortFree = await checkPort(config.phpmyadminPort);
    if (!isPortFree) {
      setStatus(serviceName, 'error');
      addLog('phpMyAdmin', 'error', `Port conflict: Port ${config.phpmyadminPort} is already in use by another application.`);
      return false;
    }
    const pmaConfigPath = path.join(app.getPath('userData'), 'config', 'phpmyadmin', 'config.inc.php');
    const pmaConfigContent = `<?php
/* Stackly phpMyAdmin Configuration */
$cfg['blowfish_secret'] = 'stackly_secure_secret_key_1234567890'; 
$i = 1;
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['port'] = '${config.mysqlPort}';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = true;
$cfg['Servers'][$i]['password'] = '${config.mysqlRootPassword.replace(/'/g, "\\\\'")}';
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
$cfg['TempDir'] = '${path.join(app.getPath('userData'), 'phpmyadmin_tmp')}';

// Configuration Storage
$cfg['Servers'][$i]['pmadb'] = 'phpmyadmin';
$cfg['Servers'][$i]['bookmarktable'] = 'pma__bookmark';
$cfg['Servers'][$i]['relation'] = 'pma__relation';
$cfg['Servers'][$i]['table_info'] = 'pma__table_info';
$cfg['Servers'][$i]['table_coords'] = 'pma__table_coords';
$cfg['Servers'][$i]['pdf_pages'] = 'pma__pdf_pages';
$cfg['Servers'][$i]['column_info'] = 'pma__column_info';
$cfg['Servers'][$i]['history'] = 'pma__history';
$cfg['Servers'][$i]['table_uiprefs'] = 'pma__table_uiprefs';
$cfg['Servers'][$i]['tracking'] = 'pma__tracking';
$cfg['Servers'][$i]['userconfig'] = 'pma__userconfig';
$cfg['Servers'][$i]['recent'] = 'pma__recent';
$cfg['Servers'][$i]['favorite'] = 'pma__favorite';
$cfg['Servers'][$i]['users'] = 'pma__users';
$cfg['Servers'][$i]['usergroups'] = 'pma__usergroups';
$cfg['Servers'][$i]['navigationhiding'] = 'pma__navigationhiding';
$cfg['Servers'][$i]['savedsearches'] = 'pma__savedsearches';
$cfg['Servers'][$i]['central_columns'] = 'pma__central_columns';
$cfg['Servers'][$i]['designer_settings'] = 'pma__designer_settings';
$cfg['Servers'][$i]['export_templates'] = 'pma__export_templates';
?>`;
    if (!fs.existsSync(path.dirname(pmaConfigPath))) {
      fs.mkdirSync(path.dirname(pmaConfigPath), { recursive: true });
    }
    fs.writeFileSync(pmaConfigPath, pmaConfigContent, 'utf-8');

    const pmaTmpPath = path.join(app.getPath('userData'), 'phpmyadmin_tmp');
    if (!fs.existsSync(pmaTmpPath)) {
      fs.mkdirSync(pmaTmpPath, { recursive: true });
    }

    command = path.join(basePath, 'runtime', 'php', 'bin', 'php');
    commandArgs = ['-S', `127.0.0.1:${config.phpmyadminPort}`, '-t', path.join(basePath, 'runtime', 'phpmyadmin'), '-c', path.join(configDir, 'php', 'php.ini')];
  } else {
    setStatus(serviceName, 'running');
    return true;
  }

  try {
    const child = spawn(command, commandArgs, {
      cwd: basePath,
      detached: true // MUST be detached so Apache's kill(0) doesn't kill Electron!
    });

    processes[serviceName].process = child;

    child.stdout?.on('data', (data) => {
      addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'info', data.toString().trim());
    });

    child.stderr?.on('data', (data) => {
      addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'warn', data.toString().trim());
    });

    child.on('error', (err) => {
      setStatus(serviceName, 'error');
      addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'error', `Failed to start: ${err.message}`);
    });

    child.on('close', (code) => {
      setStatus(serviceName, 'stopped');
      processes[serviceName].process = undefined;
      addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'info', `Process exited with code ${code}`);
    });

    // Assume running if no immediate error
    setStatus(serviceName, 'running');
    addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'info', 'Started successfully.');
    return true;
  } catch (error: any) {
    setStatus(serviceName, 'error');
    addLog(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), 'error', `Exception during start: ${error.message}`);
    return false;
  }
}

export async function killService(serviceName: ServiceName): Promise<boolean> {
  const processEntry = processes[serviceName];
  if (!processEntry || !processEntry.process) {
    setStatus(serviceName, 'stopped');
    return true;
  }

  return new Promise((resolve) => {
    setStatus(serviceName, 'stopping');
    processEntry.process!.once('close', () => {
      setStatus(serviceName, 'stopped');
      processes[serviceName].process = undefined;
      resolve(true);
    });
    
    try {
      processEntry.process!.kill('SIGTERM');
      
      setTimeout(() => {
        if (processes[serviceName]?.process) {
          addLog(serviceName, 'warn', 'Process did not terminate cleanly, sending SIGKILL...');
          processes[serviceName].process!.kill('SIGKILL');
        }
      }, 5000);
    } catch (err: any) {
      addLog(serviceName, 'error', `Failed to kill process: ${err.message}`);
      setStatus(serviceName, 'error');
      resolve(false);
    }
  });
}

export function getServiceStatus(serviceName: ServiceName): ServiceStatus {
  return processes[serviceName]?.status || 'missing';
}

export async function killAllServices(): Promise<void> {
  const { closeDbPool } = require('./dbConnection');
  await closeDbPool();
  
  const services: ServiceName[] = ['apache', 'mysql', 'php', 'phpmyadmin'];
  await Promise.all(services.map(s => killService(s)));
}

export async function forceKillZombies(): Promise<void> {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec("pkill -9 -f 'runtime/apache/bin/httpd' || true && pkill -9 -f 'runtime/mysql/bin/mysqld' || true && pkill -9 -f 'runtime/php/bin/php' || true", () => {
      resolve();
    });
  });
}
