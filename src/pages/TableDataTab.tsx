import * as React from 'react';
import { RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InsertDataModal } from './InsertDataModal';
import { EditRowModal } from './EditRowModal';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface TableDataTabProps {
  dbName: string;
  tableName: string;
  columns: any[];
}

export const TableDataTab = React.memo(({ dbName, tableName, columns }: TableDataTabProps) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [data, setData] = React.useState<{ columns: string[], rows: string[][] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showInsertModal, setShowInsertModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editRowData, setEditRowData] = React.useState<{ pkCol: string, pkVal: string, data: Record<string, string> } | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const tableData = await window.stackly.db.tableData(dbName, tableName, searchQuery);
      setData(tableData);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [dbName, tableName, searchQuery]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRow = async (pkCol: string, pkVal: string) => {
    const isConfirmed = await confirm({
      title: t('common.delete'),
      message: `Are you sure you want to delete the row where ${pkCol} = '${pkVal}'?`,
      isDanger: true,
      confirmLabel: t('common.delete'),
    });
    
    if (isConfirmed) {
      try {
        const { success, error } = await window.stackly.db.deleteRow(dbName, tableName, pkCol, pkVal);
        if (success) {
          fetchData();
          toast.success('Row deleted successfully');
        } else {
          toast.error('Failed to delete row: ' + error);
        }
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    }
  };

  const pkColumn = React.useMemo(() => columns.find(c => c.key === 'PRI')?.field, [columns]);
  const pkIndex = React.useMemo(() => pkColumn && data ? data.columns.indexOf(pkColumn) : -1, [pkColumn, data]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('dbDetail.dataLimit100')}</h3>
          <form 
            onSubmit={(e) => { e.preventDefault(); fetchData(); }}
            className="relative flex items-center"
          >
            <input 
              type="text" 
              placeholder="Search in all columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-input border border-border-strong rounded-md pl-3 pr-8 py-1.5 text-sm text-text-primary focus:outline-none focus:border-electric-blue transition-colors"
            />
            <button type="submit" className="absolute right-2 text-text-muted hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={fetchData} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowInsertModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> {t('dbDetail.insertData')}
          </Button>
        </div>
      </div>
      
      <Card className="bg-card-elevated border border-border-soft overflow-hidden flex-1 flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-text-muted">{t('dbDetail.loadingData')}</div>
        ) : !data || data.rows.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-text-muted">{t('dbDetail.emptyTable')}</div>
        ) : (
          <div className="overflow-auto custom-scrollbar flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-input/50 border-b border-border-strong text-text-secondary sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 font-medium w-24">{t('dbDetail.actions')}</th>
                  {data.columns.map((col, i) => (
                    <th key={i} className="px-4 py-2 font-medium whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {data.rows.map((row, i) => {
                  const pkVal = pkIndex >= 0 ? row[pkIndex] : null;
                  return (
                    <tr key={i} className="hover:bg-white/5 group">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-text-muted hover:text-electric-blue hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            disabled={!pkColumn || !pkVal}
                            title={!pkColumn ? "Table needs a Primary Key to edit rows" : "Edit Row"}
                            onClick={() => {
                              if (pkColumn && pkVal) {
                                const rowDataObj: Record<string, string> = {};
                                data.columns.forEach((c, idx) => rowDataObj[c] = row[idx]);
                                setEditRowData({ pkCol: pkColumn, pkVal: pkVal, data: rowDataObj });
                              }
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            disabled={!pkColumn || !pkVal}
                            title={!pkColumn ? "Table needs a Primary Key to delete rows" : "Delete Row"}
                            onClick={() => pkColumn && pkVal && handleDeleteRow(pkColumn, pkVal)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 text-text-primary whitespace-nowrap max-w-[300px] truncate" title={cell}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showInsertModal && (
        <InsertDataModal 
          dbName={dbName} 
          tableName={tableName} 
          onClose={() => setShowInsertModal(false)} 
          onSuccess={() => {
            setShowInsertModal(false);
            fetchData();
          }} 
        />
      )}

      {editRowData && (
        <EditRowModal 
          dbName={dbName} 
          tableName={tableName} 
          pkColumn={editRowData.pkCol}
          pkValue={editRowData.pkVal}
          initialData={editRowData.data}
          onClose={() => setEditRowData(null)} 
          onSuccess={() => {
            setEditRowData(null);
            fetchData();
          }} 
        />
      )}
    </div>
  );
});
