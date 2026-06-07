import { contextBridge, ipcRenderer } from 'electron';

const stacklyAPI = {
  services: {
    getStatus: () => ipcRenderer.invoke('services:get-status'),
    start: (serviceName: string) => ipcRenderer.invoke('services:start', serviceName),
    stop: (serviceName: string) => ipcRenderer.invoke('services:stop', serviceName),
    restart: (serviceName: string) => ipcRenderer.invoke('services:restart', serviceName),
    forceKillZombies: () => ipcRenderer.invoke('services:force-kill-zombies'),
    onServiceStatusChanged: (callback: (data: { serviceName: string, status: string }) => void) => {
      ipcRenderer.on('services:status-changed', (_event, data) => callback(data));
    },
  },
  ports: {
    check: (port: number) => ipcRenderer.invoke('ports:check', port),
  },
  logs: {
    get: () => ipcRenderer.invoke('logs:get'),
    clear: () => ipcRenderer.invoke('logs:clear'),
    onLogUpdate: (callback: (log: any) => void) => {
      ipcRenderer.on('logs:update', (_event, log) => callback(log));
    },
  },
  paths: {
    openHtdocs: () => ipcRenderer.invoke('paths:open-htdocs'),
    openLogs: () => ipcRenderer.invoke('paths:open-logs'),
    openBackups: () => ipcRenderer.invoke('paths:open-backups'),
    openConfig: (serviceName: string) => ipcRenderer.invoke('paths:open-config', serviceName),
    openRawLog: (serviceName: string) => ipcRenderer.invoke('paths:open-raw-log', serviceName),
  },
  browser: {
    openLocalhost: () => ipcRenderer.invoke('browser:open-localhost'),
    openPhpMyAdmin: () => ipcRenderer.invoke('browser:open-phpmyadmin'),
    openProject: (projectName: string) => ipcRenderer.invoke('browser:open-project', projectName),
    openDb: (dbName: string) => ipcRenderer.invoke('browser:open-db', dbName),
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    create: (name: string) => ipcRenderer.invoke('projects:create', name),
    createBoilerplate: (name: string, type: string) => ipcRenderer.invoke('projects:create-boilerplate', name, type),
    delete: (name: string) => ipcRenderer.invoke('projects:delete', name),
    rename: (oldName: string, newName: string) => ipcRenderer.invoke('projects:rename', oldName, newName),
    duplicate: (name: string, newName: string) => ipcRenderer.invoke('projects:duplicate', name, newName),
    importZip: () => ipcRenderer.invoke('projects:import-zip'),
    exportZip: (projectName: string) => ipcRenderer.invoke('projects:export-zip', projectName),
    openEditor: (name: string) => ipcRenderer.invoke('projects:open-editor', name),
    openFolder: (name: string) => ipcRenderer.invoke('projects:open-folder', name),
  },
  db: {
    list: () => ipcRenderer.invoke('db:list'),
    create: (name: string, collation?: string) => ipcRenderer.invoke('db:create', name, collation),
    drop: (name: string) => ipcRenderer.invoke('db:drop', name),
    tables: (dbName: string) => ipcRenderer.invoke('db:tables', dbName),
    createTable: (dbName: string, tableName: string, columns: any[]) => ipcRenderer.invoke('db:create-table', dbName, tableName, columns),
    insertRow: (dbName: string, tableName: string, data: Record<string, any>) => ipcRenderer.invoke('db:insert-row', dbName, tableName, data),
    updateRow: (dbName: string, tableName: string, pkColumn: string, pkValue: any, data: Record<string, any>) => ipcRenderer.invoke('db:update-row', dbName, tableName, pkColumn, pkValue, data),
    deleteRow: (dbName: string, tableName: string, pkColumn: string, pkValue: any) => ipcRenderer.invoke('db:delete-row', dbName, tableName, pkColumn, pkValue),
    alterTableColumn: (dbName: string, tableName: string, action: 'ADD' | 'MODIFY' | 'DROP', colDef?: any, oldColName?: string) => ipcRenderer.invoke('db:alter-table-column', dbName, tableName, action, colDef, oldColName),
    dropTable: (dbName: string, tableName: string) => ipcRenderer.invoke('db:drop-table', dbName, tableName),
    truncateTable: (dbName: string, tableName: string) => ipcRenderer.invoke('db:truncate-table', dbName, tableName),
    rawSql: (dbName: string, query: string) => ipcRenderer.invoke('db:raw-sql', dbName, query),
    tableData: (dbName: string, tableName: string, searchQuery?: string) => ipcRenderer.invoke('db:table-data', dbName, tableName, searchQuery),
    tableStructure: (dbName: string, tableName: string) => ipcRenderer.invoke('db:table-structure', dbName, tableName),
    export: (dbName: string) => ipcRenderer.invoke('db:export', dbName),
    import: (dbName: string) => ipcRenderer.invoke('db:import', dbName),
    changePassword: (newPassword: string) => ipcRenderer.invoke('db:change-password', newPassword),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data: any) => ipcRenderer.invoke('settings:update', data),
    verifyPassword: (password: string) => ipcRenderer.invoke('settings:verify-password', password),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  }
};

contextBridge.exposeInMainWorld('stackly', stacklyAPI);

export type StacklyAPI = typeof stacklyAPI;
