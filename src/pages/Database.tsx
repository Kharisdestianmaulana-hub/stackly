import * as React from 'react';
import { Database as DatabaseIcon, Trash2, Plus, RefreshCw, AlertCircle, ExternalLink, TableProperties, Rows, Type, UploadCloud } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DatabaseDetail } from './DatabaseDetail';
import { EmptyState } from '../components/ui/EmptyState';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface DatabaseInfo {
  name: string;
  sizeMb: string;
  tables: number;
  rows: number;
  collation: string;
}

export function Database() {
  const { t } = useTranslation();
  const [currentDb, setCurrentDb] = React.useState<DatabaseInfo | null>(null);
  const [databases, setDatabases] = React.useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newDbName, setNewDbName] = React.useState('');
  const [collation, setCollation] = React.useState('utf8mb4_general_ci');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isMysqlRunning, setIsMysqlRunning] = React.useState(true);
  const [projects, setProjects] = React.useState<any[]>([]);

  const collations = [
    'utf8mb4_general_ci',
    'utf8mb4_unicode_ci',
    'utf8_general_ci',
    'utf8_unicode_ci',
    'latin1_swedish_ci',
    'latin1_general_ci'
  ];

  const fetchDatabases = async (silent = false) => {
    if (!silent) setLoading(true);
    
    if (!window.stackly?.db) {
      if (!silent) setLoading(false);
      return;
    }

    try {
      const status = await window.stackly.services.getStatus();
      if (status.mysql.status !== 'running') {
        setIsMysqlRunning(false);
        if (!silent) setLoading(false);
        return;
      }
      setIsMysqlRunning(true);

      const data = await window.stackly.db.list();
      setDatabases(data);
      
      if (window.stackly.projects) {
        const projData = await window.stackly.projects.list();
        setProjects(projData);
      }
    } catch (error) {
      console.error(error);
      setIsMysqlRunning(false);
    }
    if (!silent) setLoading(false);
  };

  React.useEffect(() => {
    fetchDatabases();
    
    // Auto-sync databases every 3 seconds without showing the loading spinner
    const interval = setInterval(() => {
      fetchDatabases(true);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const confirm = useConfirm();

  const suggestedDbs = projects.filter(p => {
    const safeProjName = p.name.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    return safeProjName && !databases.some(db => db.name.toLowerCase() === safeProjName);
  });

  const handleCreateSuggested = async (name: string) => {
    if (!window.stackly?.db) return;
    const success = await window.stackly.db.create(name, 'utf8mb4_general_ci');
    if (success) {
      toast.success(t('db.createSuggestedSuccess', { name }));
      fetchDatabases();
    } else {
      toast.error(t('db.createSuggestedError'));
    }
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim() || !window.stackly?.db) return;

    const success = await window.stackly.db.create(newDbName.trim(), collation);
    if (success) {
      toast.success(t('db.createSuggestedSuccess', { name: newDbName }));
      setNewDbName('');
      setIsCreating(false);
      fetchDatabases();
    } else {
      toast.error(t('db.createSuggestedError'));
    }
  };

  const handleDeleteDatabase = async (name: string) => {
    if (!window.stackly?.db) return;
    
    // Prevent dropping system databases
    if (['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'test'].includes(name.toLowerCase())) {
      toast.error('Database sistem tidak dapat dihapus demi keamanan.');
      return;
    }

    const isConfirmed = await confirm({
      title: t('db.deleteConfirmTitle'),
      message: t('db.deleteConfirmDesc', { name }),
      isDanger: true,
      confirmLabel: t('common.delete'),
    });

    if (isConfirmed) {
      await window.stackly.db.drop(name);
      toast.success(t('db.deleteSuccess', { name }));
      fetchDatabases();
    }
  };

  if (!isMysqlRunning) {
    return (
      <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-6">
            <DatabaseIcon className="w-10 h-10 text-danger" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">{t('db.mysqlStoppedTitle')}</h2>
          <p className="text-text-secondary text-center max-w-md mb-8">
            {t('db.mysqlStoppedDesc')}
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={async () => {
              await window.stackly?.services.start('mysql');
              setTimeout(fetchDatabases, 2000);
            }}
          >
            {t('db.startMysqlNow')}
          </Button>
        </div>
      </div>
    );
  }

  if (currentDb) {
    return <DatabaseDetail db={currentDb} onBack={() => { setCurrentDb(null); fetchDatabases(true); }} />;
  }

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{t('db.title')}</h1>
          <p className="text-text-secondary">{t('db.description')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => fetchDatabases(false)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="secondary" 
            onClick={async () => {
              try {
                const { success, canceled, error } = await window.stackly.db.import(''); // Empty dbName imports at server level
                if (!canceled) {
                  if (success) {
                    toast.success('Database berhasil diimpor!');
                    fetchDatabases(true);
                  } else {
                    toast.error('Gagal mengimpor database: ' + error);
                  }
                }
              } catch (err: any) {
                toast.error('Error: ' + err.message);
              }
            }}
          >
            <UploadCloud className="w-4 h-4 mr-2" /> {t('db.importFile')}
          </Button>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t('db.newDb')}
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="mb-6 bg-card-elevated border-electric-blue/50">
          <form onSubmit={handleCreateDatabase} className="flex items-center space-x-4 p-4">
            <div className="flex-1 flex space-x-3">
              <input
                type="text"
                autoFocus
                placeholder="Nama database baru (tanpa spasi)..."
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                className="flex-1 bg-input border border-border-strong rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
              />
              <select
                value={collation}
                onChange={(e) => setCollation(e.target.value)}
                className="w-56 bg-input border border-border-strong rounded-md px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary-blue transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                {collations.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary">Create</Button>
            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
          </form>
        </Card>
      )}

      {suggestedDbs.length > 0 && !loading && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-text-secondary mr-2">Saran Pembuatan Database dari Proyek:</span>
          {suggestedDbs.map((p) => (
            <Button 
              key={p.name} 
              variant="secondary" 
              size="sm" 
              className="text-xs bg-sidebar border-dashed border-electric-blue/40 text-electric-blue hover:bg-electric-blue/10"
              onClick={() => handleCreateSuggested(p.name)}
              title={`Buat database untuk proyek ${p.name}`}
            >
              <Plus className="w-3 h-3 mr-1" /> {p.name}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted">Loading databases...</p>
        </div>
      ) : databases.length === 0 ? (
        <EmptyState
          icon={<DatabaseIcon className="w-10 h-10 text-electric-blue" />}
          title="Belum Ada Database"
          description="Anda belum membuat database MySQL apapun. Klik tombol di bawah untuk membuat database baru."
          actionLabel="Buat Database"
          onAction={() => setIsCreating(true)}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
          {databases.map((db) => {
            const isSystemDb = ['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'test'].includes(db.name.toLowerCase());
            
            return (
              <Card 
                key={db.name} 
                className={`flex flex-col justify-between transition-colors cursor-pointer hover:border-electric-blue ${isSystemDb ? 'opacity-70' : 'hover:border-border-strong group'}`}
                onClick={() => setCurrentDb(db)}
              >
                <div className="p-4 flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSystemDb ? 'bg-sidebar border border-border-soft text-text-muted' : 'bg-card-elevated border border-border-soft text-electric-blue'}`}>
                    <DatabaseIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-semibold text-text-primary truncate" title={db.name}>{db.name}</h3>
                      {isSystemDb && <span title={t('db.systemDbHover')}><AlertCircle className="w-3.5 h-3.5 text-warning" /></span>}
                    </div>
                    <p className="text-xs text-text-muted mt-1">{db.sizeMb} MB</p>
                  </div>
                </div>
                
                <div className="px-4 pb-3 grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-text-muted flex items-center"><TableProperties className="w-3 h-3 mr-1" /> Tables</span>
                    <span className="text-text-primary font-medium">{db.tables}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted flex items-center"><Rows className="w-3 h-3 mr-1" /> Rows</span>
                    <span className="text-text-primary font-medium">{db.rows}</span>
                  </div>
                  <div className="flex flex-col col-span-2 mt-1">
                    <span className="text-text-muted flex items-center"><Type className="w-3 h-3 mr-1" /> Collation</span>
                    <span className="text-text-primary font-medium truncate">{db.collation || '-'}</span>
                  </div>
                </div>
                
                <div className="px-4 pb-4 pt-1 flex space-x-2">
                  <Button 
                    variant="teal" 
                    size="sm" 
                    className="flex-1 text-xs justify-center z-10"
                    onClick={(e) => { e.stopPropagation(); window.stackly?.browser.openDb(db.name); }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> phpMyAdmin
                  </Button>
                  {!isSystemDb && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 text-xs justify-center text-danger hover:text-danger hover:bg-danger/10 z-10"
                      onClick={(e) => { e.stopPropagation(); handleDeleteDatabase(db.name); }}
                      title="Hapus Database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
