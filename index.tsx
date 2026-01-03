
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Rename the local interface to match global type definitions and avoid mismatch errors
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Global declaration to fix TypeScript errors for the AI Studio platform API
declare global {
  interface Window {
    // Re-added readonly to match the underlying platform declaration provided by the environment
    readonly aistudio: AIStudio;
  }
}

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Critical Error: Root element not found. Check your index.html.");
}
