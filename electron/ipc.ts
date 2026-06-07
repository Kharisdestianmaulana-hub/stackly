import { ipcMain, BrowserWindow, shell, app, dialog } from 'electron';
import { getAppConfig, updateAppConfig } from './config/appConfig';
import { getServiceStatus, spawnService, killService, forceKillZombies } from './services/processManager';
import { checkPort } from './services/portChecker';
import { getLogs, clearLogs } from './services/logManager';
import { getProjects, createProject, deleteProject, openProjectInEditor, openProjectFolder, renameProject, duplicateProject, createBoilerplateProject, importProjectZip, exportProjectZip } from './services/projectManager';
import { getDatabases, createDatabase, dropDatabase, changeRootPassword, exportDatabase, importDatabase } from './services/dbAdmin';
import { getTables, dropTable, truncateTable, getTableStructure, createTable, alterTableColumn } from './services/dbSchema';
import { getTableData, insertRow, deleteRow, updateRow, executeRawSql } from './services/dbData';

import * as path from 'path';

export function setupIpcHandlers() {
  ipcMain.handle('services:get-status', async () => {
    const config = getAppConfig();
    return {
      apache: { status: getServiceStatus('apache'), port: config.apachePort },
      mysql: { status: getServiceStatus('mysql'), port: config.mysqlPort },
      php: { status: getServiceStatus('php'), version: '8.2' },
      phpmyadmin: { status: getServiceStatus('phpmyadmin'), port: config.phpmyadminPort }
    };
  });

  ipcMain.handle('services:start', async (_event, serviceName) => {
    return { success: await spawnService(serviceName as any, []) };
  });

  ipcMain.handle('services:stop', async (_event, serviceName) => {
    return { success: await killService(serviceName as any) };
  });

  ipcMain.handle('services:restart', async (_event, serviceName) => {
    await killService(serviceName as any);
    return { success: await spawnService(serviceName as any, []) };
  });

  ipcMain.handle('services:force-kill-zombies', async () => {
    await forceKillZombies();
    return { success: true };
  });

  ipcMain.handle('ports:check', async (_event, port) => {
    return { isUsed: false };
  });

  ipcMain.handle('logs:get', async () => {
    return getLogs();
  });

  ipcMain.handle('logs:clear', async () => {
    clearLogs();
    return { success: true };
  });

  ipcMain.handle('paths:open-htdocs', async () => {
    shell.openPath(path.join(app.getAppPath(), 'htdocs'));
    return { success: true };
  });

  ipcMain.handle('paths:open-logs', async () => {
    shell.openPath(path.join(app.getAppPath(), 'logs'));
    return { success: true };
  });

  ipcMain.handle('paths:open-backups', async () => {
    shell.openPath(path.join(app.getAppPath(), 'backups'));
    return { success: true };
  });

  ipcMain.handle('paths:open-config', async (_event, serviceName: string) => {
    let configPath = '';
    const basePath = app.getAppPath();
    
    switch (serviceName) {
      case 'apache':
        configPath = path.join(basePath, 'config', 'apache', 'httpd.conf');
        break;
      case 'mysql':
        configPath = path.join(basePath, 'config', 'mysql', 'my.cnf');
        break;
      case 'php':
        configPath = path.join(basePath, 'config', 'php', 'php.ini');
        break;
      case 'phpmyadmin':
        configPath = path.join(basePath, 'htdocs', 'phpmyadmin', 'config.inc.php');
        break;
    }
    
    if (configPath) {
      shell.openPath(configPath);
    }
    return { success: true };
  });

  ipcMain.handle('paths:open-raw-log', async (_event, serviceName: string) => {
    let logPath = '';
    const basePath = app.getAppPath();
    
    switch (serviceName) {
      case 'apache':
        logPath = path.join(basePath, 'runtime', 'apache', 'logs', 'error_log');
        break;
      case 'mysql':
        logPath = path.join(basePath, 'data', 'mysql', 'mysql.err'); // MySQL often writes to hostname.err, but let's just open the data dir for MVP or we know exact name? Actually, MariaDB usually uses hostname.err or mariadb.err. In XAMPP it's sometimes mysql_error.log.
        // Wait, the data dir might have multiple .err files. It's safer to open the data/mysql directory or the specific .err file if we know it. I will open the data/mysql directory so the user can see all logs.
        logPath = path.join(basePath, 'data', 'mysql');
        break;
      case 'php':
        logPath = path.join(basePath, 'config', 'php', 'logs', 'php_error_log');
        break;
    }
    
    if (logPath) {
      shell.openPath(logPath);
    }
    return { success: true };
  });

  ipcMain.handle('browser:open-localhost', async () => {
    shell.openExternal(`http://localhost:${getAppConfig().apachePort}`);
    return { success: true };
  });

  ipcMain.handle('browser:open-phpmyadmin', async () => {
    shell.openExternal(`http://localhost:${getAppConfig().phpmyadminPort}`);
    return { success: true };
  });

  ipcMain.handle('browser:open-db', async (_event, dbName: string) => {
    shell.openExternal(`http://localhost:${getAppConfig().phpmyadminPort}/index.php?route=/database/structure&server=1&db=${dbName}`);
    return { success: true };
  });

  ipcMain.handle('browser:open-project', async (_event, projectName: string) => {
    shell.openExternal(`http://localhost:${getAppConfig().apachePort}/${projectName}`);
    return { success: true };
  });

  ipcMain.handle('projects:list', async () => {
    return await getProjects();
  });

  ipcMain.handle('projects:create', async (_event, name: string) => {
    return { success: await createProject(name) };
  });

  ipcMain.handle('projects:create-boilerplate', async (_event, name, type) => {
    return createBoilerplateProject(name, type);
  });

  ipcMain.handle('projects:delete', async (_event, name) => {
    return deleteProject(name);
  });

  ipcMain.handle('projects:rename', async (_event, oldName, newName) => {
    return renameProject(oldName, newName);
  });

  ipcMain.handle('projects:duplicate', async (_event, name, newName) => {
    return duplicateProject(name, newName);
  });

  ipcMain.handle('projects:import-zip', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Zip Files', extensions: ['zip'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return importProjectZip(result.filePaths[0]);
    }
    return { success: false, message: 'Canceled' };
  });

  ipcMain.handle('projects:export-zip', async (_event, projectName) => {
    const result = await dialog.showSaveDialog({
      defaultPath: `${projectName}-backup.zip`,
      filters: [{ name: 'Zip Files', extensions: ['zip'] }]
    });
    if (!result.canceled && result.filePath) {
      return exportProjectZip(projectName, result.filePath);
    }
    return { success: false, message: 'Canceled' };
  });

  ipcMain.handle('projects:open-editor', async (_event, name: string) => {
    return { success: await openProjectInEditor(name) };
  });

  ipcMain.handle('projects:open-folder', async (_event, name: string) => {
    return { success: await openProjectFolder(name) };
  });

  ipcMain.handle('db:list', async () => {
    return await getDatabases();
  });

  ipcMain.handle('db:create', async (_event, name: string, collation?: string) => {
    return { success: await createDatabase(name, collation) };
  });

  ipcMain.handle('db:drop', async (_event, name: string) => {
    return { success: await dropDatabase(name) };
  });

  ipcMain.handle('db:tables', async (_event, dbName: string) => {
    return await getTables(dbName);
  });

  ipcMain.handle('db:drop-table', async (_event, dbName: string, tableName: string) => {
    return { success: await dropTable(dbName, tableName) };
  });

  ipcMain.handle('db:truncate-table', async (_event, dbName: string, tableName: string) => {
    return { success: await truncateTable(dbName, tableName) };
  });

  ipcMain.handle('db:raw-sql', async (_event, dbName: string, query: string) => {
    return await executeRawSql(dbName, query);
  });

  ipcMain.handle('db:table-data', async (_event, dbName: string, tableName: string, searchQuery?: string) => {
    return await getTableData(dbName, tableName, 100, searchQuery);
  });

  ipcMain.handle('db:table-structure', async (_event, dbName: string, tableName: string) => {
    return await getTableStructure(dbName, tableName);
  });

  ipcMain.handle('db:create-table', async (_event, dbName: string, tableName: string, columns: any[]) => {
    return await createTable(dbName, tableName, columns);
  });

  ipcMain.handle('db:insert-row', async (_event, dbName: string, tableName: string, data: Record<string, any>) => {
    return await insertRow(dbName, tableName, data);
  });

  ipcMain.handle('db:delete-row', async (_event, dbName: string, tableName: string, pkColumn: string, pkValue: any) => {
    return await deleteRow(dbName, tableName, pkColumn, pkValue);
  });

  ipcMain.handle('db:update-row', async (_event, dbName: string, tableName: string, pkColumn: string, pkValue: any, data: Record<string, any>) => {
    return await updateRow(dbName, tableName, pkColumn, pkValue, data);
  });

  ipcMain.handle('db:alter-table-column', async (_event, dbName: string, tableName: string, action: 'ADD' | 'MODIFY' | 'DROP', colDef?: any, oldColName?: string) => {
    return await alterTableColumn(dbName, tableName, action, colDef, oldColName);
  });

  ipcMain.handle('db:export', async (event, dbName: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'Window not found' };
    
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Database',
      defaultPath: `${dbName}_backup_${new Date().toISOString().split('T')[0]}.sql`,
      filters: [{ name: 'SQL File', extensions: ['sql'] }]
    });

    if (canceled || !filePath) return { success: false, canceled: true };

    return await exportDatabase(dbName, filePath);
  });

  ipcMain.handle('db:import', async (event, dbName: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'Window not found' };

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import Database',
      properties: ['openFile'],
      filters: [{ name: 'SQL File', extensions: ['sql'] }]
    });

    if (canceled || filePaths.length === 0) return { success: false, canceled: true };

    return await importDatabase(dbName, filePaths[0]);
  });

  ipcMain.handle('db:change-password', async (_event, newPassword: string) => {
    const success = await changeRootPassword(newPassword);
    if (success) {
      // Update config so dbManager and App knows the new password
      updateAppConfig({ mysqlRootPassword: newPassword, appLocked: !!newPassword });
    }
    return { success };
  });

  ipcMain.handle('settings:get', async () => {
    const config = getAppConfig();
    const { mysqlRootPassword, ...safeConfig } = config;
    return safeConfig;
  });

  ipcMain.handle('settings:update', async (_event, data: any) => {
    if (data.apachePort) {
      require('./services/configEditor').updateApachePort(data.apachePort);
    }
    if (data.mysqlPort) {
      require('./services/configEditor').updateMysqlPort(data.mysqlPort);
    }
    return updateAppConfig(data);
  });

  ipcMain.handle('settings:verify-password', async (_event, password: string) => {
    const config = getAppConfig();
    return config.mysqlRootPassword === password;
  });

  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });
}
