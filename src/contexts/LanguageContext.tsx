import * as React from 'react';
import { en } from '../locales/en';
import { id } from '../locales/id';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('en');

  // Load language from backend on mount
  React.useEffect(() => {
    const fetchLang = async () => {
      if (window.stackly?.settings) {
        const conf = await window.stackly.settings.get();
        if (conf.language) {
          setLanguageState(conf.language);
        }
      }
    };
    fetchLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (window.stackly?.settings) {
      await window.stackly.settings.update({ language: lang });
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict: any = language === 'id' ? id : en;
    const keys = key.split('.');
    let result = dict;
    
    for (const k of keys) {
      if (result[k] === undefined) {
        return key; // fallback to key if not found
      }
      result = result[k];
    }
    
    if (typeof result !== 'string') return key;

    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? String(params[k]) : `{${k}}`);
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
