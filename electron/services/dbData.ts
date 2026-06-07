import { executeQuery, executeRaw } from './dbConnection';
import { getTableStructure } from './dbSchema';

export async function getTableData(dbName: string, tableName: string, limit = 100, searchQuery?: string): Promise<{ columns: string[], rows: string[][] }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeDb || !safeTable) return { columns: [], rows: [] };
  
  try {
    let query = `SELECT * FROM \`${safeDb}\`.\`${safeTable}\``;
    let params: any[] = [];
    
    if (searchQuery && searchQuery.trim() !== '') {
      const cols = await getTableStructure(safeDb, safeTable);
      if (cols.length > 0) {
        const whereClause = cols.map(c => `\`${c.field}\` LIKE ?`).join(' OR ');
        query += ` WHERE ${whereClause}`;
        params = cols.map(() => `%${searchQuery}%`);
      }
    }
    
    query += ` LIMIT ?;`;
    params.push(limit);
    
    const results = await executeQuery(query, params) as Record<string, any>[];
    
    if (results.length === 0) {
      // If no data, still try to return columns
      const cols = await getTableStructure(safeDb, safeTable);
      return { columns: cols.map(c => c.field), rows: [] };
    }
    
    const columns = Object.keys(results[0]);
    const rows = results.map(row => columns.map(col => {
      const val = row[col];
      if (val === null) return 'NULL';
      if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' '); // Simple format
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    }));
    
    return { columns, rows };
  } catch (error) {
    console.error('Error fetching table data:', error);
    return { columns: [], rows: [] };
  }
}

export async function insertRow(dbName: string, tableName: string, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!safeDb || !safeTable || Object.keys(data).length === 0) return { success: false, error: 'Invalid parameters' };

  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const columns = keys.map(k => `\`${k.replace(/[^a-zA-Z0-9_]/g, '')}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO \`${safeDb}\`.\`${safeTable}\` (${columns}) VALUES (${placeholders});`;
    
    await executeQuery(query, values.map(v => v === '' ? null : v));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function updateRow(dbName: string, tableName: string, pkColumn: string, pkValue: any, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  const safePkColumn = pkColumn.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!safeDb || !safeTable || !safePkColumn || Object.keys(data).length === 0) {
    return { success: false, error: 'Invalid parameters' };
  }

  try {
    const setClause: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([col, val]) => {
      const safeCol = col.replace(/[^a-zA-Z0-9_]/g, '');
      setClause.push(`\`${safeCol}\` = ?`);
      values.push(val === '' ? null : val);
    });
    
    const query = `UPDATE \`${safeDb}\`.\`${safeTable}\` SET ${setClause.join(', ')} WHERE \`${safePkColumn}\` = ? LIMIT 1;`;
    values.push(pkValue);
    
    await executeQuery(query, values);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function deleteRow(dbName: string, tableName: string, pkColumn: string, pkValue: any): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  const safePkColumn = pkColumn.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!safeDb || !safeTable || !safePkColumn) return { success: false, error: 'Invalid parameters' };

  try {
    const query = `DELETE FROM \`${safeDb}\`.\`${safeTable}\` WHERE \`${safePkColumn}\` = ? LIMIT 1;`;
    await executeQuery(query, [pkValue]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function executeRawSql(dbName: string, query: string): Promise<{ success: boolean; result?: string; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  try {
    const fullQuery = safeDb ? `USE \`${safeDb}\`;\n${query}` : query;
    const result = await executeRaw(fullQuery);
    return { success: true, result: JSON.stringify(result, null, 2) };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
