import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Force rebuild: 2025-01-13 02:16:00
export default defineConfig({
  plugins: [react()],
  build: { 
    outDir: 'dist',
    // Force new build hash
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
});
