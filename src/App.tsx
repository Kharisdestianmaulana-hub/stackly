import { useState, useEffect, Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard'; // Keep dashboard eager for fast load
import { LockScreen } from './components/LockScreen';

const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const Database = lazy(() => import('./pages/Database').then(m => ({ default: m.Database })));
const Logs = lazy(() => import('./pages/Logs').then(m => ({ default: m.Logs })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

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

import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      if (window.stackly?.settings) {
        const config = await window.stackly.settings.get();
        if (config.appLocked) {
          setIsLocked(true);
        }
        if (config.accentColor) {
          applyAccentColor(config.accentColor);
        }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen bg-[#050B14]"></div>;
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <LanguageProvider>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1A2130',
            color: '#E2E8F0',
            border: '1px solid #2A3441',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DA3633',
              secondary: '#fff',
            },
          },
        }}
      />
      <ConfirmProvider>
        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-text-secondary">Loading...</div>}>
            {activeTab === 'dashboard' && <div className="animate-fade-in h-full"><Dashboard /></div>}
            {activeTab === 'services' && <div className="animate-fade-in h-full"><Services /></div>}
            {activeTab === 'projects' && <div className="animate-fade-in h-full"><Projects /></div>}
            {activeTab === 'db' && <div className="animate-fade-in h-full"><Database /></div>}
            {activeTab === 'logs' && <div className="animate-fade-in h-full"><Logs /></div>}
            {activeTab === 'settings' && <div className="animate-fade-in h-full"><Settings /></div>}
          </Suspense>
        </AppShell>
      </ConfirmProvider>
    </LanguageProvider>
  );
}

export default App;
