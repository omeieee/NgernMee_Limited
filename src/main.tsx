// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme on document
try {
  const stored = localStorage.getItem('ngernmee-storage');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
} catch {
  // Ignore localStorage read errors during initial load
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
