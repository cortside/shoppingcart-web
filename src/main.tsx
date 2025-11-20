import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { loadConfig } from './utils/config';

// Load configuration before rendering the app
try {
  await loadConfig();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to load configuration:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">Configuration Error</h1>
        <p style="color: #4b5563; margin-bottom: 16px;">Failed to load application configuration. Please ensure config.json exists in the public directory.</p>
        <p style="color: #6b7280; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    </div>
  `;
}
