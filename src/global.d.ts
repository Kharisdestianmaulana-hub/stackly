import { StacklyAPI } from '../electron/preload';

declare global {
  interface Window {
    stackly: StacklyAPI & {
      browser: {
        openLocalhost: () => Promise<{ success: boolean }>;
        openPhpMyAdmin: () => Promise<{ success: boolean }>;
        openProject: (projectName: string) => Promise<{ success: boolean }>;
        openDb: (dbName: string) => Promise<{ success: boolean }>;
      };
      paths: {
        openHtdocs: () => Promise<{ success: boolean }>;
        openLogs: () => Promise<{ success: boolean }>;
        openBackups: () => Promise<{ success: boolean }>;
        openConfig: (serviceName: string) => Promise<{ success: boolean }>;
        openRawLog: (serviceName: string) => Promise<{ success: boolean }>;
      };
      projects: {
        list: () => Promise<Array<{ name: string, size: string, modifiedAt: number }>>;
        create: (name: string) => Promise<{ success: boolean }>;
        delete: (name: string) => Promise<{ success: boolean }>;
        openEditor: (name: string) => Promise<{ success: boolean }>;
        openFolder: (name: string) => Promise<{ success: boolean }>;
      };
      db: {
        list: () => Promise<Array<{ name: string, sizeMb: string, tables: number, rows: number, collation: string }>>;
        create: (name: string, collation?: string) => Promise<{ success: boolean }>;
        drop: (name: string) => Promise<{ success: boolean }>;
        tables: (dbName: string) => Promise<Array<{ name: string, engine: string, rows: number, sizeMb: string, collation: string }>>;
        createTable: (dbName: string, tableName: string, columns: any[]) => Promise<{ success: boolean, error?: string }>;
        insertRow: (dbName: string, tableName: string, data: Record<string, any>) => Promise<{ success: boolean, error?: string }>;
        updateRow: (dbName: string, tableName: string, pkColumn: string, pkValue: any, data: Record<string, any>) => Promise<{ success: boolean, error?: string }>;
        deleteRow: (dbName: string, tableName: string, pkColumn: string, pkValue: any) => Promise<{ success: boolean, error?: string }>;
        alterTableColumn: (dbName: string, tableName: string, action: 'ADD' | 'MODIFY' | 'DROP', colDef?: any, oldColName?: string) => Promise<{ success: boolean, error?: string }>;
        dropTable: (dbName: string, tableName: string) => Promise<{ success: boolean }>;
        truncateTable: (dbName: string, tableName: string) => Promise<{ success: boolean }>;
        rawSql: (dbName: string, query: string) => Promise<{ success: boolean; result?: string; error?: string }>;
        tableData: (dbName: string, tableName: string, searchQuery?: string) => Promise<{ columns: string[], rows: string[][] }>;
        tableStructure: (dbName: string, tableName: string) => Promise<Array<{ field: string, type: string, null: string, key: string, default: string, extra: string }>>;
        export: (dbName: string) => Promise<{ success: boolean, canceled?: boolean, error?: string }>;
        import: (dbName: string) => Promise<{ success: boolean, canceled?: boolean, error?: string }>;
        changePassword: (newPassword: string) => Promise<{ success: boolean }>;
      };
      services: {
        start: (serviceName: string) => Promise<boolean>;
        stop: (serviceName: string) => Promise<boolean>;
        restart: (serviceName: string) => Promise<boolean>;
        onServiceStatusChanged: (callback: (data: { serviceName: string, status: string }) => void) => void;
      };
      settings: {
        get: () => Promise<any>;
        update: (data: any) => Promise<any>;
        verifyPassword: (password: string) => Promise<boolean>;
      };
    };
  }
}

export {};
