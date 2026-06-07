import * as React from 'react';
import { Settings as SettingsIcon, Monitor, PlayCircle, HardDrive, Trash2, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface AppConfig {
  apachePort: number;
  mysqlPort: number;
  phpmyadminPort: number;
  htdocsPath: string;
  autoStartServices: boolean;
  theme: 'dark' | 'light' | 'system';
  accentColor?: string;
  language?: 'en' | 'id';
}

export function Settings() {
  const { t, setLanguage, language } = useTranslation();
  const confirm = useConfirm();
  const [config, setConfig] = React.useState<AppConfig | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchConfig = async () => {
      if (window.stackly?.settings) {
        const data = await window.stackly.settings.get();
        setConfig(data);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleUpdate = async (key: keyof AppConfig, value: any) => {
    if (!config || !window.stackly?.settings) return;
    
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    await window.stackly.settings.update({ [key]: value });
  };

  const handleFactoryReset = async () => {
    const isConfirmed = await confirm({
      title: t('settings.resetConfirmTitle'),
      message: t('settings.resetConfirmDesc'),
      isDanger: true,
      confirmLabel: t('settings.resetConfirmLabel'),
    });
    if (isConfirmed) {
      await handleUpdate('autoStartServices', false);
      toast.success('Pengaturan telah direset ke default pabrik.');
    }
  };

  if (loading || !config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto h-full flex flex-col pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{t('settings.title')}</h1>
        <p className="text-text-secondary">{t('settings.description')}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
        
        {/* Behavior Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <PlayCircle className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.general')}</h2>
          </div>
          <Card className="divide-y divide-border-soft">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.language')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.languageDesc')}</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'id')}
                className="bg-input border border-border-strong rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-blue w-32"
              >
                <option value="en">English</option>
                <option value="id">Indonesia</option>
              </select>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.autoStart')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.autoStartDesc')}</p>
              </div>
              <Switch 
                checked={config.autoStartServices} 
                onChange={(checked) => handleUpdate('autoStartServices', checked)} 
              />
            </div>
          </Card>
        </section>

        {/* Network & Ports Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-electric-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.systemConfig')}</h2>
          </div>
          <Card className="divide-y divide-border-soft">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.apachePort')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.apachePortDesc')}</p>
              </div>
              <input 
                type="number" 
                value={config.apachePort}
                onChange={(e) => handleUpdate('apachePort', parseInt(e.target.value))}
                className="bg-input border border-border-strong rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-blue w-24 text-center"
              />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.mysqlPort')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.mysqlPortDesc')}</p>
              </div>
              <input 
                type="number" 
                value={config.mysqlPort}
                onChange={(e) => handleUpdate('mysqlPort', parseInt(e.target.value))}
                className="bg-input border border-border-strong rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-blue w-24 text-center"
              />
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.phpmyadminPort')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.phpmyadminPortDesc')}</p>
              </div>
              <input 
                type="number" 
                value={config.phpmyadminPort}
                onChange={(e) => handleUpdate('phpmyadminPort', parseInt(e.target.value))}
                className="bg-input border border-border-strong rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-blue w-24 text-center"
              />
            </div>
          </Card>
        </section>

        {/* Appearance Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.theme')}</h2>
          </div>
          <Card className="divide-y divide-border-soft">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.appTheme')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.appThemeDesc')}</p>
              </div>
              <select 
                value={config.theme}
                onChange={(e) => handleUpdate('theme', e.target.value)}
                className="bg-input border border-border-strong rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-blue"
              >
                <option value="dark">Dark Mode (Default)</option>
                <option value="light" disabled>Light Mode (Coming Soon)</option>
              </select>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.accentColor')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.accentColorDesc')}</p>
              </div>
              <div className="flex items-center space-x-2">
                {[
                  { id: 'blue', color: '#3794FF' },
                  { id: 'green', color: '#10b981' },
                  { id: 'purple', color: '#8b5cf6' },
                  { id: 'orange', color: '#f97316' },
                  { id: 'red', color: '#f43f5e' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleUpdate('accentColor', c.id);
                      // Apply immediately to current session
                      const applyAccentColor = (color: string) => {
                        const colors: Record<string, { primary: string, electric: string }> = {
                          blue: { primary: '#0078D4', electric: '#3794FF' },
                          green: { primary: '#059669', electric: '#10b981' },
                          purple: { primary: '#7c3aed', electric: '#8b5cf6' },
                          orange: { primary: '#ea580c', electric: '#f97316' },
                          red: { primary: '#e11d48', electric: '#f43f5e' },
                        };
                        const selected = colors[color] || colors.blue;
                        document.documentElement.style.setProperty('--color-primary', selected.primary);
                        document.documentElement.style.setProperty('--color-electric', selected.electric);
                      };
                      applyAccentColor(c.id);
                    }}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${config.accentColor === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-card-elevated' : 'border border-black/20'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.id.charAt(0).toUpperCase() + c.id.slice(1)}
                  />
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* System Info Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.systemInfo')}</h2>
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted block mb-1">Apache Port</span>
                <span className="text-text-primary font-mono bg-sidebar px-2 py-1 rounded">8080</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">MySQL Port</span>
                <span className="text-text-primary font-mono bg-sidebar px-2 py-1 rounded">3307</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">phpMyAdmin Port</span>
                <span className="text-text-primary font-mono bg-sidebar px-2 py-1 rounded">8081</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">{t('settings.version')}</span>
                <span className="text-text-primary font-mono">v1.0.0-MVP</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Security Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4 mt-8">
            <ShieldAlert className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.security')}</h2>
          </div>
          <Card>
            <div className="p-5 flex flex-col space-y-4">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.masterPassword')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.masterPasswordDesc')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="password"
                  placeholder={t('settings.newPasswordPlaceholder')}
                  id="new-password-input"
                  className="flex-1 bg-input border border-border-strong rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
                />
                <Button 
                  variant="secondary" 
                  onClick={async () => {
                    const input = document.getElementById('new-password-input') as HTMLInputElement;
                    if (!input) return;
                    
                    if (input.value === '') {
                      const isConfirmed = await confirm({
                        title: t('settings.removePasswordTitle'),
                        message: t('settings.removePasswordDesc'),
                        isDanger: true,
                        confirmLabel: t('settings.removePasswordLabel'),
                      });
                      if (!isConfirmed) return;
                    }
                    
                    const success = await window.stackly?.db.changePassword(input.value);
                    if (success) {
                      toast.success(input.value ? 'Password berhasil diubah! Aplikasi sekarang terkunci.' : 'Password berhasil dihapus. Aplikasi tidak lagi terkunci.');
                      input.value = '';
                    } else {
                      toast.error('Gagal mengubah password. Pastikan MySQL sedang berjalan.');
                    }
                  }}
                >
                  {t('settings.setPassword')}
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section>
          <div className="flex items-center space-x-2 mb-4 mt-8">
            <ShieldAlert className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">{t('settings.advanced')}</h2>
          </div>
          <Card>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary mb-1">{t('settings.reset')}</h3>
                <p className="text-sm text-text-secondary">{t('settings.resetConfirmDesc')}</p>
              </div>
              <Button variant="danger" onClick={handleFactoryReset}>
                <Trash2 className="w-4 h-4 mr-2" /> {t('settings.reset')}
              </Button>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
