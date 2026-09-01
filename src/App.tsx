import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';
import AppRoutes from './routes/AppRoutes';

export function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <ToastContainer />
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
