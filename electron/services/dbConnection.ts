import mysql from 'mysql2/promise';
import { getServiceStatus } from './processManager';
import { getAppConfig } from '../config/appConfig';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    const config = getAppConfig();
    pool = mysql.createPool({
      host: '127.0.0.1',
      port: config.mysqlPort,
      user: 'root',
      password: config.mysqlRootPassword || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true // Allow multiple queries in one string (e.g. for raw SQL)
    });
  }
  return pool;
}

export function closeDbPool(): Promise<void> {
  return new Promise((resolve) => {
    if (pool) {
      pool.end().then(() => {
        pool = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Execute a query with parameters using the connection pool.
 * This should be the primary way to interact with the database.
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  if (getServiceStatus('mysql') !== 'running') {
    throw new Error('MySQL is not running');
  }

  const db = getDbPool();
  try {
    const [results] = await db.query(query, params);
    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Execute raw queries that might contain multiple statements
 */
export async function executeRaw(query: string): Promise<any> {
  if (getServiceStatus('mysql') !== 'running') {
    throw new Error('MySQL is not running');
  }

  const db = getDbPool();
  try {
    const [results] = await db.query(query);
    return results;
  } catch (error) {
    throw error;
  }
}
