import * as React from 'react';
import { RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlterColumnModal } from './AlterColumnModal';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface TableStructureTabProps {
  dbName: string;
  tableName: string;
  columns: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const TableStructureTab = React.memo(({ dbName, tableName, columns, loading, onRefresh }: TableStructureTabProps) => {
  const { t } = useTranslation();
  const [showAlterModal, setShowAlterModal] = React.useState<'add' | 'edit' | null>(null);
  const [alterColumnData, setAlterColumnData] = React.useState<any>(null);

  const confirm = useConfirm();
  const handleDropColumn = async (colName: string) => {
    const isConfirmed = await confirm({
      title: t('common.delete'),
      message: `Are you sure you want to drop the column '${colName}'?\nThis will delete all data in this column permanently!`,
      isDanger: true,
      confirmLabel: t('common.delete'),
    });
    if (isConfirmed) {
      try {
        const { success, error } = await window.stackly.db.alterTableColumn(dbName, tableName, 'DROP', { name: colName });
        if (success) {
          onRefresh();
        } else {
          alert('Failed to drop column: ' + error);
        }
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-lg font-semibold text-text-primary">{t('dbDetail.columns')}</h3>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onRefresh} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowAlterModal('add')} size="sm">
            <Plus className="w-4 h-4 mr-2" /> {t('dbDetail.addColumn')}
          </Button>
        </div>
      </div>
      
      <Card className="bg-card-elevated border border-border-soft overflow-hidden flex-1 flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-text-muted">{t('dbDetail.loadingStructure')}</div>
        ) : columns.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-text-muted">{t('dbDetail.noColumns')}</div>
        ) : (
          <div className="overflow-auto custom-scrollbar flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-input/50 border-b border-border-strong text-text-secondary sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium w-24">{t('dbDetail.actions')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.field')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.type')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.null')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.key')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.default')}</th>
                  <th className="px-4 py-3 font-medium">{t('dbDetail.extra')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {columns.map((col, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-text-muted hover:text-electric-blue hover:bg-white/10 rounded"
                          title="Edit Column"
                          onClick={() => {
                            let type = col.type.toUpperCase();
                            let length = '';
                            if (type.includes('(')) {
                              const match = type.match(/(.*?)\((.*?)\)/);
                              if (match) {
                                type = match[1];
                                length = match[2];
                              }
                            }
                            
                            setAlterColumnData({
                              name: col.field,
                              type,
                              length,
                              nullable: col.null === 'YES',
                              autoIncrement: col.extra.includes('auto_increment')
                            });
                            setShowAlterModal('edit');
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded"
                          title="Drop Column"
                          onClick={() => handleDropColumn(col.field)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{col.field}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">{col.type}</td>
                    <td className="px-4 py-3 text-text-secondary">{col.null}</td>
                    <td className="px-4 py-3 text-electric-blue font-semibold">{col.key}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">{col.default || 'NULL'}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{col.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAlterModal && (
        <AlterColumnModal
          dbName={dbName}
          tableName={tableName}
          initialData={showAlterModal === 'edit' ? alterColumnData : undefined}
          onClose={() => setShowAlterModal(null)}
          onSuccess={() => {
            setShowAlterModal(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
});
