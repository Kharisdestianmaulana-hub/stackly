import * as React from 'react';
import { X, Plus, Trash2, Key } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTranslation } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

export interface ColumnDefinition {
  name: string;
  type: string;
  length: string;
  nullable: boolean;
  autoIncrement: boolean;
  primaryKey: boolean;
  defaultValue: string;
}

interface CreateTableModalProps {
  dbName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DATA_TYPES = [
  'INT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP', 
  'FLOAT', 'DOUBLE', 'DECIMAL', 'BOOLEAN', 'ENUM', 'JSON'
];

export function CreateTableModal({ dbName, onClose, onSuccess }: CreateTableModalProps) {
  const { t } = useTranslation();
  const [tableName, setTableName] = React.useState('');
  const [columns, setColumns] = React.useState<ColumnDefinition[]>([
    { name: 'id', type: 'INT', length: '11', nullable: false, autoIncrement: true, primaryKey: true, defaultValue: '' }
  ]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const addColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'VARCHAR', length: '255', nullable: true, autoIncrement: false, primaryKey: false, defaultValue: '' }
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ColumnDefinition, value: any) => {
    const newCols = [...columns];
    
    newCols[index] = { ...newCols[index], [field]: value };
    
    if (field === 'autoIncrement' && value === true) {
      newCols[index].primaryKey = true;
      if (newCols[index].type === 'VARCHAR' || newCols[index].type === 'TEXT') {
        newCols[index].type = 'INT';
        newCols[index].length = '11';
      }
    }

    setColumns(newCols);
  };

  const handleSave = async () => {
    if (!tableName.trim()) {
      setError('Table name cannot be empty');
      return;
    }

    const validColumns = columns.filter(c => c.name.trim() !== '');
    if (validColumns.length === 0) {
      setError('You must add at least one column with a name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { success, error: submitError } = await window.stackly.db.createTable(dbName, tableName.trim(), validColumns);
      
      if (success) {
        toast.success(t('dbDetail.tableCreatedSuccessfully'));
        onSuccess();
      } else {
        setError(submitError || 'Failed to create table');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
    
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="bg-background border border-border-strong w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-border-soft flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{t('dbDetail.createNewTable')}</h2>
            <p className="text-sm text-text-secondary mt-1">{t('dbDetail.database')}: <span className="text-electric-blue">{dbName}</span></p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">{t('dbDetail.tableName')}</label>
            <input 
              type="text" 
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="e.g. users, products, orders"
              className="w-full max-w-md bg-input border border-border-strong rounded-md p-2 text-text-primary focus:outline-none focus:border-electric-blue transition-colors"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-md font-semibold text-text-primary">{t('dbDetail.columns')}</h3>
            <Button variant="secondary" size="sm" onClick={addColumn}>
              <Plus className="w-4 h-4 mr-2" /> Add Column
            </Button>
          </div>

          <div className="border border-border-soft rounded-lg overflow-hidden bg-card-elevated">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-input/50 border-b border-border-strong text-text-secondary sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium w-48">{t('dbDetail.name')}</th>
                  <th className="px-4 py-3 font-medium w-32">{t('dbDetail.type')}</th>
                  <th className="px-4 py-3 font-medium w-24">{t('dbDetail.lengthValues')}</th>
                  <th className="px-4 py-3 font-medium w-32">{t('dbDetail.default')}</th>
                  <th className="px-4 py-3 font-medium text-center w-20">{t('dbDetail.null')}</th>
                  <th className="px-4 py-3 font-medium text-center w-20">{t('dbDetail.ai')}</th>
                  <th className="px-4 py-3 font-medium text-center w-24">{t('dbDetail.primaryKey')}</th>
                  <th className="px-4 py-3 font-medium w-12"></th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border-soft">
                  {columns.map((col, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={col.name}
                          onChange={e => handleChange(index, 'name', e.target.value)}
                          placeholder="column_name"
                          className="w-full bg-input border border-border-strong rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-electric-blue text-xs"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          value={col.type}
                          onChange={e => handleChange(index, 'type', e.target.value)}
                          className="w-full bg-input border border-border-strong rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-electric-blue text-xs"
                        >
                          {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={col.length}
                          onChange={e => handleChange(index, 'length', e.target.value)}
                          placeholder="255"
                          className="w-full bg-input border border-border-strong rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-electric-blue text-xs"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={col.defaultValue}
                          onChange={e => handleChange(index, 'defaultValue', e.target.value)}
                          placeholder="NULL / Default"
                          className="w-full bg-input border border-border-strong rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-electric-blue text-xs"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={col.nullable}
                          onChange={e => handleChange(index, 'nullable', e.target.checked)}
                          className="w-4 h-4 accent-electric-blue cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={col.autoIncrement}
                          onChange={e => handleChange(index, 'autoIncrement', e.target.checked)}
                          className="w-4 h-4 accent-electric-blue cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => handleChange(index, 'primaryKey', !col.primaryKey)}
                          className={`p-1.5 rounded-md transition-colors ${col.primaryKey ? 'bg-warning/20 text-warning' : 'text-text-muted hover:text-text-secondary hover:bg-white/10'}`}
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => handleRemoveColumn(index)}
                          className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                          disabled={columns.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border-soft flex justify-end space-x-3 bg-card shrink-0">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !tableName.trim() || columns.some(c => !c.name.trim())}>
            {saving ? t('common.loading') : t('dbDetail.createTable')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
