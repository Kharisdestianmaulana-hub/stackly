import { executeQuery, executeRaw } from './dbConnection';

export interface TableInfo {
  name: string;
  engine: string;
  rows: number;
  sizeMb: string;
  collation: string;
}

export interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string;
  extra: string;
}

export async function getTables(dbName: string): Promise<TableInfo[]> {
  const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeName) return [];
  try {
    const query = `SELECT TABLE_NAME as name, ENGINE as engine, TABLE_ROWS as rows, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as sizeMb, TABLE_COLLATION as collation FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?;`;
    const results = await executeQuery(query, [safeName]) as any[];
    
    return results.map(r => ({
      name: r.name,
      engine: r.engine || '-',
      rows: Number(r.rows) || 0,
      sizeMb: r.sizeMb !== null ? String(r.sizeMb) : '0.00',
      collation: r.collation || '-'
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export async function getTableStructure(dbName: string, tableName: string): Promise<ColumnInfo[]> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeDb || !safeTable) return [];
  
  try {
    const query = `SHOW COLUMNS FROM \`${safeDb}\`.\`${safeTable}\`;`;
    const results = await executeQuery(query) as any[];
    
    return results.map(r => ({
      field: r.Field,
      type: r.Type,
      null: r.Null,
      key: r.Key,
      default: r.Default === null ? '' : String(r.Default),
      extra: r.Extra
    }));
  } catch (error) {
    console.error('Error fetching table structure:', error);
    return [];
  }
}

export interface ColumnDefinition {
  name: string;
  type: string;
  length: string;
  nullable: boolean;
  autoIncrement: boolean;
  primaryKey: boolean;
  defaultValue: string;
}

export async function createTable(dbName: string, tableName: string, columns: ColumnDefinition[]): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!safeDb || !safeTable || !columns || columns.length === 0) {
    return { success: false, error: 'Invalid parameters' };
  }

  try {
    let query = `CREATE TABLE \`${safeDb}\`.\`${safeTable}\` (\n`;
    
    const colDefs = columns.map(col => {
      const safeColName = col.name.replace(/[^a-zA-Z0-9_]/g, '');
      let def = `  \`${safeColName}\` ${col.type}`;
      if (col.length) def += `(${col.length})`;
      
      if (!col.nullable) def += ' NOT NULL';
      
      if (col.defaultValue) {
        if (col.defaultValue.toUpperCase() === 'NULL') {
          def += ` DEFAULT NULL`;
        } else if (col.defaultValue.toUpperCase() === 'CURRENT_TIMESTAMP') {
          def += ` DEFAULT CURRENT_TIMESTAMP`;
        } else {
          def += ` DEFAULT '${col.defaultValue.replace(/'/g, "''")}'`;
        }
      }
      
      if (col.autoIncrement) def += ' AUTO_INCREMENT';
      return def;
    });

    const primaryKeys = columns.filter(c => c.primaryKey).map(c => `\`${c.name.replace(/[^a-zA-Z0-9_]/g, '')}\``);
    if (primaryKeys.length > 0) {
      colDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    query += colDefs.join(',\n') + '\n);';
    await executeQuery(query);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function dropTable(dbName: string, tableName: string): Promise<boolean> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeDb || !safeTable) return false;
  try {
    await executeQuery(`DROP TABLE \`${safeDb}\`.\`${safeTable}\`;`);
    return true;
  } catch (error) {
    console.error('Error dropping table:', error);
    return false;
  }
}

export async function truncateTable(dbName: string, tableName: string): Promise<boolean> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!safeDb || !safeTable) return false;
  try {
    await executeQuery(`TRUNCATE TABLE \`${safeDb}\`.\`${safeTable}\`;`);
    return true;
  } catch (error) {
    console.error('Error truncating table:', error);
    return false;
  }
}

export async function alterTableColumn(
  dbName: string, 
  tableName: string, 
  action: 'ADD' | 'MODIFY' | 'DROP', 
  colDef?: any, 
  oldColName?: string
): Promise<{ success: boolean; error?: string }> {
  const safeDb = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!safeDb || !safeTable) return { success: false, error: 'Invalid parameters' };

  try {
    let alterQuery = `ALTER TABLE \`${safeDb}\`.\`${safeTable}\``;
    
    if (action === 'DROP') {
      if (!colDef || !colDef.name) throw new Error("Column name required for DROP");
      const safeColName = colDef.name.replace(/[^a-zA-Z0-9_]/g, '');
      alterQuery += ` DROP COLUMN \`${safeColName}\``;
    } else if (action === 'ADD' || action === 'MODIFY') {
      if (!colDef) throw new Error("Column definition required");
      const safeColName = colDef.name.replace(/[^a-zA-Z0-9_]/g, '');
      let colDefString = `\`${safeColName}\` ${colDef.type}`;
      if (colDef.length) colDefString += `(${colDef.length})`;
      if (!colDef.nullable) colDefString += ' NOT NULL';
      if (colDef.autoIncrement) colDefString += ' AUTO_INCREMENT';
      
      if (action === 'ADD') {
        alterQuery += ` ADD ${colDefString}`;
      } else {
        if (oldColName && oldColName !== colDef.name) {
          const safeOldColName = oldColName.replace(/[^a-zA-Z0-9_]/g, '');
          alterQuery += ` CHANGE \`${safeOldColName}\` ${colDefString}`;
        } else {
          alterQuery += ` MODIFY ${colDefString}`;
        }
      }
    }
    
    await executeQuery(alterQuery + ';');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
