import { executeQuery, executeRaw } from './dbConnection';
import { getServiceStatus } from './processManager';
import { getAppConfig } from '../config/appConfig';
import { execFile } from 'child_process';
import { app } from 'electron';
import * as path from 'path';

const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();

export interface DatabaseInfo {
  name: string;
  sizeMb: string;
  tables: number;
  rows: number;
  collation: string;
}

export async function getDatabases(): Promise<DatabaseInfo[]> {
  try {
    const query = `SELECT s.SCHEMA_NAME, s.DEFAULT_COLLATION_NAME, COUNT(t.TABLE_NAME) as tablesCount, SUM(t.TABLE_ROWS) as rowsCount, ROUND(SUM(t.DATA_LENGTH + t.INDEX_LENGTH) / 1024 / 1024, 2) as sizeMb FROM information_schema.SCHEMATA s LEFT JOIN information_schema.TABLES t ON s.SCHEMA_NAME = t.TABLE_SCHEMA GROUP BY s.SCHEMA_NAME;`;
    const rows = await executeQuery(query) as any[];
    
    return rows.map(r => ({
      name: r.SCHEMA_NAME,
      collation: r.DEFAULT_COLLATION_NAME,
      tables: Number(r.tablesCount) || 0,
      rows: Number(r.rowsCount) || 0,
      sizeMb: r.sizeMb !== null ? String(r.sizeMb) : '0.00'
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching databases:', error);
    return [];
  }
}

export async function createDatabase(name: string, collation?: string): Promise<boolean> {
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeName) return false;
  
  try {
    let query = `CREATE DATABASE \`${safeName}\``;
    if (collation && /^[a-zA-Z0-9_]+$/.test(collation)) {
      const charset = collation.split('_')[0];
      query += ` CHARACTER SET ${charset} COLLATE ${collation}`;
    }
    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

export async function dropDatabase(name: string): Promise<boolean> {
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeName) return false;

  try {
    await executeQuery(`DROP DATABASE \`${safeName}\`;`);
    return true;
  } catch (error) {
    console.error('Error dropping database:', error);
    return false;
  }
}

export async function changeRootPassword(newPassword: string): Promise<boolean> {
  try {
    const safePassword = newPassword.replace(/'/g, "''");
    await executeRaw(`ALTER USER 'root'@'localhost' IDENTIFIED BY '${safePassword}'; FLUSH PRIVILEGES;`);
    return true;
  } catch (error) {
    console.error('Error changing root password:', error);
    return false;
  }
}

// Keep export/import using CLI tools for better performance with large dumps
export async function exportDatabase(dbName: string, destPath: string): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeDb) return { success: false, error: 'Invalid database name' };

  if (getServiceStatus('mysql') !== 'running') {
    return { success: false, error: 'MySQL is not running' };
  }

  return new Promise((resolve) => {
    const config = getAppConfig();
    const args = ['-h', '127.0.0.1', '-P', String(config.mysqlPort), '-u', 'root'];
    if (config.mysqlRootPassword) {
      args.push(`-p${config.mysqlRootPassword}`);
    }
    
    args.push(`--result-file=${destPath}`);
    args.push(safeDb);

    // Use bundled mariadb dump
    const dumpCmd = path.join(basePath, 'runtime', 'mysql', 'bin', 'mysqldump');

    execFile(dumpCmd, args, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message || String(stderr) });
      } else {
        resolve({ success: true });
      }
    });
  });
}

export async function importDatabase(dbName: string, sourcePath: string): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName ? dbName.replace(/[^a-zA-Z0-9_]/g, '') : '';
  
  if (getServiceStatus('mysql') !== 'running') {
    return { success: false, error: 'MySQL is not running' };
  }

  return new Promise((resolve) => {
    const config = getAppConfig();
    const args = ['-h', '127.0.0.1', '-P', String(config.mysqlPort), '-u', 'root'];
    if (config.mysqlRootPassword) {
      args.push(`-p${config.mysqlRootPassword}`);
    }
    
    if (safeDb) {
      args.push(safeDb);
    }
    
    args.push('-e', `source ${sourcePath}`);

    const mysqlCmd = path.join(basePath, 'runtime', 'mysql', 'bin', 'mysql');

    execFile(mysqlCmd, args, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message || String(stderr) });
      } else {
        resolve({ success: true });
      }
    });
  });
}
