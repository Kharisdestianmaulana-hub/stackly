import * as React from 'react';
import { ArrowLeft, TableProperties, Terminal, Settings, Trash2, Database as DatabaseIcon, RefreshCw, Eye, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TableDetail } from './TableDetail';
import { CreateTableModal } from './CreateTableModal';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface TableInfo {
  name: string;
  engine: string;
  rows: number;
  sizeMb: string;
  collation: string;
}

interface DatabaseDetailProps {
  db: {
    name: string;
    sizeMb: string;
    tables: number;
    collation: string;
  };
  onBack: () => void;
}

export function DatabaseDetail({ db, onBack }: DatabaseDetailProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = React.useState<'tables' | 'sql' | 'operations'>('tables');
  const [tables, setTables] = React.useState<TableInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // SQL Editor State
  const [sqlQuery, setSqlQuery] = React.useState('');
  const [sqlResult, setSqlResult] = React.useState<{ columns: string[], rows: string[][] } | null>(null);
  const [sqlError, setSqlError] = React.useState('');
  const [executingSql, setExecutingSql] = React.useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await window.stackly.db.tables(db.name);
      setTables(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (activeTab === 'tables' && !selectedTable) {
      fetchTables();
    }
  }, [activeTab, selectedTable]);

  const handleDropTable = async (tableName: string) => {
    const isConfirmed = await confirm({
      title: t('dbDetail.dropTable'),
      message: t('dbDetail.dropTableConfirm', { name: tableName }),
      isDanger: true,
      confirmLabel: t('common.delete'),
    });
    if (isConfirmed) {
      await window.stackly.db.dropTable(db.name, tableName);
      toast.success(t('dbDetail.dropSuccess', { name: tableName }));
      fetchTables();
    }
  };

  const handleTruncateTable = async (tableName: string) => {
    const isConfirmed = await confirm({
      title: t('dbDetail.truncateTable'),
      message: t('dbDetail.truncateTableConfirm', { name: tableName }),
      isDanger: true,
      confirmLabel: t('dbDetail.truncate'),
    });
    if (isConfirmed) {
      await window.stackly.db.truncateTable(db.name, tableName);
      toast.success(t('dbDetail.truncateSuccess', { name: tableName }));
      fetchTables();
    }
  };

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setExecutingSql(true);
    setSqlError('');
    setSqlResult(null);

    const { success, result, error } = await window.stackly.db.rawSql(db.name, sqlQuery);
    if (success && result !== undefined) {
      if (result.trim() === '') {
        setSqlResult({ columns: ['Result'], rows: [['Query executed successfully. (0 rows returned)']] });
      } else {
        const lines = result.trim().split('\n');
        const columns = lines[0].split('\t');
        const rows = lines.slice(1).map(line => line.split('\t'));
        setSqlResult({ columns, rows });
      }
    } else {
      setSqlError(error || 'Unknown error occurred');
    }
    setExecutingSql(false);
  };

  const isSystemDb = ['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'test'].includes(db.name.toLowerCase());

  if (selectedTable) {
    return <TableDetail dbName={db.name} tableName={selectedTable} onBack={() => setSelectedTable(null)} />;
  }

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 px-3 hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> {t('common.back')}
          </Button>
          <div className="h-8 w-px bg-border-soft"></div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center">
              <DatabaseIcon className="w-6 h-6 mr-3 text-electric-blue" />
              {db.name}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {db.collation} • {db.sizeMb} MB • {db.tables} {t('db.tables')}
            </p>
          </div>
        </div>
        <div>
          <Button variant="secondary" onClick={() => window.stackly?.browser.openDb(db.name)}>
            {t('db.openPma')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-border-strong">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tables' ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center"><TableProperties className="w-4 h-4 mr-2" /> {t('db.tables')}</div>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sql' ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center"><Terminal className="w-4 h-4 mr-2" /> {t('dbDetail.sqlQuery')}</div>
        </button>
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'operations' ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center"><Settings className="w-4 h-4 mr-2" /> {t('dbDetail.settings')}</div>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* TAB 1: TABLES */}
        {activeTab === 'tables' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Tables</h2>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={fetchTables} disabled={loading} size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> New Table
                </Button>
              </div>
            </div>
            
            <Card className="bg-card-elevated border border-border-soft overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-text-muted">Loading tables...</div>
              ) : tables.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No tables found in this database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-sidebar border-b border-border-strong text-text-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Table Name</th>
                        <th className="px-4 py-3 font-medium">Engine</th>
                        <th className="px-4 py-3 font-medium">Collation</th>
                        <th className="px-4 py-3 font-medium text-right">Rows</th>
                        <th className="px-4 py-3 font-medium text-right">Size</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {tables.map(t => (
                        <tr 
                          key={t.name} 
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedTable(t.name)}
                        >
                          <td className="px-4 py-3 font-medium text-text-primary flex items-center">
                            <TableProperties className="w-4 h-4 mr-2 text-text-muted" />
                            {t.name}
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{t.engine}</td>
                          <td className="px-4 py-3 text-text-secondary">{t.collation}</td>
                          <td className="px-4 py-3 text-right text-text-primary">{t.rows}</td>
                          <td className="px-4 py-3 text-right text-text-secondary">{t.sizeMb} MB</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedTable(t.name); }} className="h-7 px-2 text-xs">
                                <Eye className="w-3.5 h-3.5 mr-1" /> {t('common.view')}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleTruncateTable(t.name); }} className="h-7 px-2 text-xs">
                                {t('dbDetail.truncate')}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDropTable(t.name); }} className="h-7 px-2 text-xs text-danger hover:text-danger hover:bg-danger/10">
                                {t('common.delete')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: SQL EDITOR */}
        {activeTab === 'sql' && (
          <div className="flex flex-col h-full space-y-4">
            <Card className="bg-card-elevated border border-border-soft p-4 flex flex-col shrink-0">
              <label className="text-sm font-medium text-text-primary mb-2 flex items-center">
                Run SQL query on database <code className="ml-2 px-1.5 py-0.5 bg-sidebar rounded text-electric-blue">{db.name}</code>
              </label>
              <textarea
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                placeholder="SELECT * FROM users..."
                className="w-full h-32 bg-input border border-border-strong rounded-md p-3 text-text-primary font-mono text-sm focus:outline-none focus:border-primary-blue resize-y mb-4 custom-scrollbar"
                spellCheck={false}
              />
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleExecuteSql} disabled={executingSql || !sqlQuery.trim()}>
                  {executingSql ? 'Executing...' : 'Run Query'}
                </Button>
              </div>
            </Card>

            {sqlError && (
              <Card className="bg-danger/10 border border-danger/20 p-4 text-danger font-mono text-sm whitespace-pre-wrap">
                {sqlError}
              </Card>
            )}

            {sqlResult && (
              <Card className="bg-card-elevated border border-border-soft overflow-hidden flex-1 flex flex-col min-h-[300px]">
                <div className="px-4 py-3 border-b border-border-strong bg-sidebar flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary">Query Results ({sqlResult.rows.length} rows)</h3>
                </div>
                <div className="overflow-auto custom-scrollbar flex-1 p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-input/50 border-b border-border-strong text-text-secondary sticky top-0">
                      <tr>
                        {sqlResult.columns.map((col, i) => (
                          <th key={i} className="px-4 py-2 font-medium whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {sqlResult.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-text-primary whitespace-nowrap max-w-[300px] truncate" title={cell}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <Card className="bg-card-elevated border border-border-soft p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                {t('dbDetail.backupRestore')}
              </h3>
              
              <div className="space-y-4">
                <div className="border border-border-soft rounded-lg p-5 bg-background flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">{t('dbDetail.exportDb')}</h4>
                    <p className="text-sm text-text-secondary mt-1">{t('dbDetail.exportDesc')}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={async () => {
                      try {
                        const { success, canceled, error } = await window.stackly.db.export(db.name);
                        if (!canceled) {
                          if (success) {
                            alert('Database berhasil diekspor!');
                          } else {
                            alert('Gagal mengekspor database: ' + error);
                          }
                        }
                      } catch (err: any) {
                        alert('Error: ' + err.message);
                      }
                    }}
                  >
                    Export
                  </Button>
                </div>

                <div className="border border-border-soft rounded-lg p-5 bg-background flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">{t('dbDetail.importDb')}</h4>
                    <p className="text-sm text-text-secondary mt-1">{t('dbDetail.importDesc')}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={async () => {
                      const isConfirmed = await confirm({
                        title: t('dbDetail.overwriteTables'),
                        message: t('dbDetail.importWarning'),
                        isDanger: true,
                        confirmLabel: t('dbDetail.importLabel'),
                      });
                      if (isConfirmed) {
                        try {
                          const { success, canceled, error } = await window.stackly.db.import(db.name);
                          if (!canceled) {
                            if (success) {
                              toast.success('Database berhasil diimpor!');
                              fetchTables();
                            } else {
                              toast.error('Gagal mengimpor database: ' + error);
                            }
                          }
                        } catch (err: any) {
                          toast.error('Error: ' + err.message);
                        }
                      }
                    }}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-card-elevated border border-border-soft p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center text-danger">
                <Trash2 className="w-5 h-5 mr-2" /> {t('dbDetail.dangerZone')}
              </h3>
              <p className="text-text-secondary mb-6 max-w-2xl">
                {t('dbDetail.dangerWarning')}
              </p>
              
              <div className="border border-danger/30 rounded-lg p-5 bg-danger/5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-text-primary">{t('dbDetail.dropDb')}</h4>
                  <p className="text-sm text-text-secondary mt-1">{t('dbDetail.dropDbDesc')}</p>
                </div>
                <Button 
                  variant="danger" 
                  disabled={isSystemDb}
                  onClick={async () => {
                    const isConfirmed = await confirm({
                      title: t('db.deleteConfirmTitle'),
                      message: t('db.deleteConfirmDesc', { name: db.name }),
                      isDanger: true,
                      confirmLabel: t('common.delete'),
                    });
                    if (isConfirmed) {
                      await window.stackly.db.drop(db.name);
                      toast.success(`Database ${db.name} berhasil dihapus.`);
                      onBack();
                    }
                  }}
                >
                  Drop Database
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTableModal 
          dbName={db.name} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTables();
          }} 
        />
      )}
    </div>
  );
}
