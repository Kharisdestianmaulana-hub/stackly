var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var stacklyAPI = {
  services: {
    getStatus: () => import_electron.ipcRenderer.invoke("services:get-status"),
    start: (serviceName) => import_electron.ipcRenderer.invoke("services:start", serviceName),
    stop: (serviceName) => import_electron.ipcRenderer.invoke("services:stop", serviceName),
    restart: (serviceName) => import_electron.ipcRenderer.invoke("services:restart", serviceName),
    forceKillZombies: () => import_electron.ipcRenderer.invoke("services:force-kill-zombies"),
    onServiceStatusChanged: (callback) => {
      import_electron.ipcRenderer.on("services:status-changed", (_event, data) => callback(data));
    }
  },
  ports: {
    check: (port) => import_electron.ipcRenderer.invoke("ports:check", port)
  },
  logs: {
    get: () => import_electron.ipcRenderer.invoke("logs:get"),
    clear: () => import_electron.ipcRenderer.invoke("logs:clear"),
    onLogUpdate: (callback) => {
      import_electron.ipcRenderer.on("logs:update", (_event, log) => callback(log));
    }
  },
  paths: {
    openHtdocs: () => import_electron.ipcRenderer.invoke("paths:open-htdocs"),
    openLogs: () => import_electron.ipcRenderer.invoke("paths:open-logs"),
    openBackups: () => import_electron.ipcRenderer.invoke("paths:open-backups"),
    openConfig: (serviceName) => import_electron.ipcRenderer.invoke("paths:open-config", serviceName),
    openRawLog: (serviceName) => import_electron.ipcRenderer.invoke("paths:open-raw-log", serviceName)
  },
  browser: {
    openLocalhost: () => import_electron.ipcRenderer.invoke("browser:open-localhost"),
    openPhpMyAdmin: () => import_electron.ipcRenderer.invoke("browser:open-phpmyadmin"),
    openProject: (projectName) => import_electron.ipcRenderer.invoke("browser:open-project", projectName),
    openDb: (dbName) => import_electron.ipcRenderer.invoke("browser:open-db", dbName)
  },
  projects: {
    list: () => import_electron.ipcRenderer.invoke("projects:list"),
    create: (name) => import_electron.ipcRenderer.invoke("projects:create", name),
    createBoilerplate: (name, type) => import_electron.ipcRenderer.invoke("projects:create-boilerplate", name, type),
    delete: (name) => import_electron.ipcRenderer.invoke("projects:delete", name),
    rename: (oldName, newName) => import_electron.ipcRenderer.invoke("projects:rename", oldName, newName),
    duplicate: (name, newName) => import_electron.ipcRenderer.invoke("projects:duplicate", name, newName),
    importZip: () => import_electron.ipcRenderer.invoke("projects:import-zip"),
    exportZip: (projectName) => import_electron.ipcRenderer.invoke("projects:export-zip", projectName),
    openEditor: (name) => import_electron.ipcRenderer.invoke("projects:open-editor", name),
    openFolder: (name) => import_electron.ipcRenderer.invoke("projects:open-folder", name)
  },
  db: {
    list: () => import_electron.ipcRenderer.invoke("db:list"),
    create: (name, collation) => import_electron.ipcRenderer.invoke("db:create", name, collation),
    drop: (name) => import_electron.ipcRenderer.invoke("db:drop", name),
    tables: (dbName) => import_electron.ipcRenderer.invoke("db:tables", dbName),
    createTable: (dbName, tableName, columns) => import_electron.ipcRenderer.invoke("db:create-table", dbName, tableName, columns),
    insertRow: (dbName, tableName, data) => import_electron.ipcRenderer.invoke("db:insert-row", dbName, tableName, data),
    updateRow: (dbName, tableName, pkColumn, pkValue, data) => import_electron.ipcRenderer.invoke("db:update-row", dbName, tableName, pkColumn, pkValue, data),
    deleteRow: (dbName, tableName, pkColumn, pkValue) => import_electron.ipcRenderer.invoke("db:delete-row", dbName, tableName, pkColumn, pkValue),
    alterTableColumn: (dbName, tableName, action, colDef, oldColName) => import_electron.ipcRenderer.invoke("db:alter-table-column", dbName, tableName, action, colDef, oldColName),
    dropTable: (dbName, tableName) => import_electron.ipcRenderer.invoke("db:drop-table", dbName, tableName),
    truncateTable: (dbName, tableName) => import_electron.ipcRenderer.invoke("db:truncate-table", dbName, tableName),
    rawSql: (dbName, query) => import_electron.ipcRenderer.invoke("db:raw-sql", dbName, query),
    tableData: (dbName, tableName, searchQuery) => import_electron.ipcRenderer.invoke("db:table-data", dbName, tableName, searchQuery),
    tableStructure: (dbName, tableName) => import_electron.ipcRenderer.invoke("db:table-structure", dbName, tableName),
    export: (dbName) => import_electron.ipcRenderer.invoke("db:export", dbName),
    import: (dbName) => import_electron.ipcRenderer.invoke("db:import", dbName),
    changePassword: (newPassword) => import_electron.ipcRenderer.invoke("db:change-password", newPassword)
  },
  settings: {
    get: () => import_electron.ipcRenderer.invoke("settings:get"),
    update: (data) => import_electron.ipcRenderer.invoke("settings:update", data),
    verifyPassword: (password) => import_electron.ipcRenderer.invoke("settings:verify-password", password)
  },
  window: {
    minimize: () => import_electron.ipcRenderer.invoke("window:minimize"),
    maximize: () => import_electron.ipcRenderer.invoke("window:maximize"),
    close: () => import_electron.ipcRenderer.invoke("window:close")
  }
};
import_electron.contextBridge.exposeInMainWorld("stackly", stacklyAPI);
