import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string;
  extra: string;
}

interface EditRowModalProps {
  dbName: string;
  tableName: string;
  pkColumn: string;
  pkValue: any;
  initialData: Record<string, string>;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRowModal({ dbName, tableName, pkColumn, pkValue, initialData, onClose, onSuccess }: EditRowModalProps) {
  const [columns, setColumns] = React.useState<ColumnInfo[]>([]);
  const [formData, setFormData] = React.useState<Record<string, string>>(initialData);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchStructure = async () => {
      try {
        const structure = await window.stackly.db.tableStructure(dbName, tableName);
        setColumns(structure);
      } catch (err) {
        setError('Failed to fetch table structure');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStructure();
  }, [dbName, tableName]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Prepare data to submit (only include fields that actually exist as columns)
    const dataToSubmit: Record<string, string> = {};
    columns.forEach(col => {
      // Do not allow updating the primary key value if we are depending on it to identify the row.
      // Wait, MySQL allows updating the PK, but for simplicity let's allow it if they changed it, 
      // but `updateRow` still uses the ORIGINAL `pkValue` in the WHERE clause, which is correct!
      dataToSubmit[col.field] = formData[col.field] ?? '';
    });

    try {
      const { success, error: submitError } = await window.stackly.db.updateRow(dbName, tableName, pkColumn, pkValue, dataToSubmit);
      
      if (success) {
        onSuccess();
      } else {
        setError(submitError || 'Failed to update data');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="bg-background border border-border-strong w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border-soft bg-sidebar shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Edit Row</h2>
            <p className="text-sm text-text-secondary mt-1">Table: <span className="text-electric-blue">{tableName}</span> (PK: {pkColumn} = {pkValue})</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="text-center text-text-muted py-8">Loading table structure...</div>
          ) : (
            <form id="editForm" onSubmit={handleSubmit} className="space-y-4">
              {columns.map(col => (
                <div key={col.field} className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-text-primary truncate" title={col.field}>
                      {col.field} {col.key === 'PRI' && <span className="text-electric-blue ml-1" title="Primary Key">🔑</span>}
                    </label>
                    <p className="text-xs text-text-muted truncate mt-0.5">{col.type}</p>
                  </div>
                  <div className="col-span-2">
                    <input 
                      type={col.type.includes('int') || col.type.includes('float') || col.type.includes('double') ? 'number' : 'text'}
                      value={formData[col.field] ?? ''}
                      onChange={e => handleChange(col.field, e.target.value)}
                      placeholder={`Value for ${col.field}`}
                      className="w-full bg-input border border-border-strong rounded-md p-2 text-text-primary focus:outline-none focus:border-electric-blue transition-colors placeholder:text-text-muted/50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </form>
          )}

          {error && (
            <div className="mt-6 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-soft bg-sidebar flex justify-end space-x-3 shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="editForm" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
