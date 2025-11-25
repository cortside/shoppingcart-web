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
  const rootEl = document.getElementById('root');
  if (rootEl) {
    // Create error container safely without innerHTML
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;';

    const content = document.createElement('div');
    content.style.cssText = 'max-width: 500px; text-align: center;';

    const heading = document.createElement('h1');
    heading.style.cssText = 'color: #dc2626; font-size: 24px; margin-bottom: 16px;';
    heading.textContent = 'Configuration Error';

    const message = document.createElement('p');
    message.style.cssText = 'color: #4b5563; margin-bottom: 16px;';
    message.textContent = 'Failed to load application configuration. Please ensure config.json exists in the public directory.';

    const errorMsg = document.createElement('p');
    errorMsg.style.cssText = 'color: #6b7280; font-size: 14px;';
    errorMsg.textContent = error instanceof Error ? error.message : 'Unknown error';

    content.appendChild(heading);
    content.appendChild(message);
    content.appendChild(errorMsg);
    container.appendChild(content);
    rootEl.appendChild(container);
  }
}
