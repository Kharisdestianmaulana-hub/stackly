import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface ColumnDef {
  name: string;
  type: string;
  length: string;
  nullable: boolean;
  autoIncrement: boolean;
}

interface AlterColumnModalProps {
  dbName: string;
  tableName: string;
  initialData?: {
    name: string;
    type: string;
    length: string;
    nullable: boolean;
    autoIncrement: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const DATA_TYPES = [
  'INT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP', 
  'FLOAT', 'DOUBLE', 'DECIMAL', 'BOOLEAN', 'ENUM', 'JSON'
];

export function AlterColumnModal({ dbName, tableName, initialData, onClose, onSuccess }: AlterColumnModalProps) {
  const isEdit = !!initialData;
  const [formData, setFormData] = React.useState<ColumnDef>(initialData || {
    name: '',
    type: 'VARCHAR',
    length: '255',
    nullable: true,
    autoIncrement: false
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = (field: keyof ColumnDef, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Column name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const action = isEdit ? 'MODIFY' : 'ADD';
      const { success, error: submitError } = await window.stackly.db.alterTableColumn(
        dbName, 
        tableName, 
        action, 
        formData, 
        isEdit ? initialData.name : undefined
      );
      
      if (success) {
        onSuccess();
      } else {
        setError(submitError || `Failed to ${action.toLowerCase()} column`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="bg-background border border-border-strong w-full max-w-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-soft bg-sidebar">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{isEdit ? 'Edit Column' : 'Add Column'}</h2>
            <p className="text-sm text-text-secondary mt-1">Table: <span className="text-electric-blue">{tableName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="alterForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Column Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. status"
                className="w-full bg-input border border-border-strong rounded-md p-2 text-text-primary focus:outline-none focus:border-electric-blue transition-colors"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => handleChange('type', e.target.value)}
                  className="w-full bg-input border border-border-strong rounded-md p-2 text-text-primary focus:outline-none focus:border-electric-blue transition-colors appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Length/Values</label>
                <input 
                  type="text" 
                  value={formData.length}
                  onChange={e => handleChange('length', e.target.value)}
                  placeholder="e.g. 255"
                  className="w-full bg-input border border-border-strong rounded-md p-2 text-text-primary focus:outline-none focus:border-electric-blue transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-6 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.nullable}
                  onChange={e => handleChange('nullable', e.target.checked)}
                  className="w-4 h-4 rounded border-border-strong bg-input text-electric-blue focus:ring-electric-blue"
                />
                <span className="text-sm text-text-primary">Nullable</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.autoIncrement}
                  onChange={e => handleChange('autoIncrement', e.target.checked)}
                  disabled={formData.type !== 'INT'}
                  className="w-4 h-4 rounded border-border-strong bg-input text-electric-blue focus:ring-electric-blue disabled:opacity-50"
                />
                <span className={`text-sm ${formData.type !== 'INT' ? 'text-text-muted' : 'text-text-primary'}`}>Auto Increment</span>
              </label>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-soft bg-sidebar flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="alterForm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Column'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
