// src/App.tsx
// Application root with React Router HashRouter, Code Splitting (React.lazy), and AuthGuard

import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { useAppStore } from './stores/useAppStore';

// Code-split pages for performance
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const TransactionsPage = lazy(() =>
  import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const TaxPage = lazy(() =>
  import('./pages/TaxPage').then((m) => ({ default: m.TaxPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);

const PageLoadingSpinner: React.FC = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
      <span className="text-xs text-slate-500 dark:text-slate-400">กำลังโหลดเนื้อหา...</span>
    </div>
  </div>
);

export function App() {
  const theme = useAppStore((s) => s.theme);

  // Keep <html> class in sync with stored theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  return (
    <HashRouter>
      <Suspense fallback={<PageLoadingSpinner />}>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes wrapped with AuthGuard and AppShell */}
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
