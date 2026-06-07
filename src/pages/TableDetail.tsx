import * as React from 'react';
import { ArrowLeft, List, Columns, Database as DatabaseIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TableDataTab } from './TableDataTab';
import { TableStructureTab } from './TableStructureTab';
import { useTranslation } from '../contexts/LanguageContext';

interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string;
  extra: string;
}

interface TableDetailProps {
  dbName: string;
  tableName: string;
  onBack: () => void;
}

export function TableDetail({ dbName, tableName, onBack }: TableDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'data' | 'structure'>('data');
  const [columns, setColumns] = React.useState<ColumnInfo[]>([]);
  const [loadingStruct, setLoadingStruct] = React.useState(true);

  const fetchStructure = React.useCallback(async () => {
    setLoadingStruct(true);
    try {
      const cols = await window.stackly.db.tableStructure(dbName, tableName);
      setColumns(cols);
    } catch (error) {
      console.error(error);
    }
    setLoadingStruct(false);
  }, [dbName, tableName]);

  React.useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2 px-3 hover:bg-white/5">
          <ArrowLeft className="w-5 h-5 mr-2" /> {t('common.back')}
        </Button>
        <div className="h-8 w-px bg-border-soft"></div>
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center">
            <DatabaseIcon className="w-5 h-5 mr-2 text-text-muted" />
            {dbName} <span className="text-text-muted mx-2">/</span> <span className="text-electric-blue">{tableName}</span>
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-border-strong shrink-0">
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center"><List className="w-4 h-4 mr-2" /> {t('dbDetail.dataLimit100').replace(' (Limit 100)', '')}</div>
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'structure' ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center"><Columns className="w-4 h-4 mr-2" /> {t('dbDetail.loadingStructure').replace('...', '')}</div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'data' && (
          <TableDataTab dbName={dbName} tableName={tableName} columns={columns} />
        )}

        {activeTab === 'structure' && (
          <TableStructureTab dbName={dbName} tableName={tableName} columns={columns} loading={loadingStruct} onRefresh={fetchStructure} />
        )}
      </div>
    </div>
  );
}
