
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global declaration to fix TypeScript errors for the AI Studio platform API.
// Restored the 'readonly' modifier to ensure alignment with existing global declarations
// and resolve the "identical modifiers" error for the 'aistudio' property.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
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
  console.error("Critical Error: Root element not found.");
}
