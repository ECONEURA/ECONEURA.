import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      // Backend Node.js (puerto 8080) - CRÍTICO para invokeAgent()
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // friendly local path for the mock AI server used by the cockpit preview
      '/dev-mock-ai': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/dev-mock-ai/, '/'),
      },
    },
  },
  preview: { host: '0.0.0.0', port: 3000 },
});
