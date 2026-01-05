
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global declaration to fix TypeScript errors for the AI Studio platform API.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: Removed the 'readonly' modifier to ensure this declaration matches the internal platform definition.
    aistudio: AIStudio;
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
