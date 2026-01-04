import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsState } from '../types';

const DEFAULT_SETTINGS: SettingsState = {
  financial: {
    currency: 'BRL',
    closeDay: 5,
    autoSaveGoal: true,
  },
  notifications: {
    reminderDays: 3,
    deadlineAlert: true,
    aiInsights: true,
  },
  appearance: {
    theme: 'light',
    hideValues: false,
  },
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (section: keyof SettingsState, data: any) => void;
  toggleTheme: () => void;
  exportData: () => void;
  clearData: () => void;
  formatCurrency: (value: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('planeja_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('planeja_settings', JSON.stringify(settings));
    
    // Apply Theme
    if (settings.appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (section: keyof SettingsState, data: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const toggleTheme = () => {
    updateSettings('appearance', { theme: settings.appearance.theme === 'light' ? 'dark' : 'light' });
  };

  const exportData = () => {
    const appData = localStorage.getItem('planeja_data');
    const settingsData = localStorage.getItem('planeja_settings');
    
    const blob = new Blob([JSON.stringify({ lists: JSON.parse(appData || '[]'), settings: JSON.parse(settingsData || '{}') }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planeja_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearData = () => {
    localStorage.removeItem('planeja_data');
    localStorage.removeItem('planeja_settings');
    window.location.href = '/';
  };

  // Helper global para formatar moedas baseado na configuração
  const formatCurrency = (value: number) => {
    if (settings.appearance.hideValues) return '••••••';

    let locale = 'pt-BR';
    let currency = 'BRL';

    switch (settings.financial.currency) {
      case 'USD':
        locale = 'en-US';
        currency = 'USD';
        break;
      case 'EUR':
        locale = 'de-DE'; // Formato europeu padrão
        currency = 'EUR';
        break;
      default:
        locale = 'pt-BR';
        currency = 'BRL';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // Visual mais limpo para valores inteiros
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleTheme, exportData, clearData, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};