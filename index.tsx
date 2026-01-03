
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define the expected AIStudio interface to resolve TypeScript conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Global declaration to fix TypeScript errors for the AI Studio platform API
declare global {
  interface Window {
    // The property must be readonly to match the underlying platform declaration provided by the environment
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
