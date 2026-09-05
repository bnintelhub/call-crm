import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { ToastContainer } from './components/shared/Toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
