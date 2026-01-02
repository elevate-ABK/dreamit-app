import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // This increases the limit to 1000kB to stop the Vercel warning 
    // regarding your 532.97 kB file size.
    chunkSizeWarningLimit: 1000,
  },
});