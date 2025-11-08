import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      'html2canvas': 'html2canvas/dist/html2canvas.esm.js'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/html2canvas/, /node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['html2canvas'],
    esbuildOptions: {
      plugins: []
    }
  }
});

