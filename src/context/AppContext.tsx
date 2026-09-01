import React, { createContext, useContext } from 'react';
import { useOrgStore } from '../store/orgStore';
import { useThemeStore } from '../store/themeStore';

interface AppContextType {
  companyName: string;
  companyLogoLetter: string;
  theme: string;
  toggleTheme: () => void;
  setCompanyName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { companyName, companyLogoLetter, setOrg } = useOrgStore();
  const { theme, toggleTheme } = useThemeStore();

  const value: AppContextType = {
    companyName,
    companyLogoLetter,
    theme,
    toggleTheme,
    setCompanyName: (name: string) => setOrg(name),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
