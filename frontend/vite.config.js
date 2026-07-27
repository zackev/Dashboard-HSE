import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Saat development, Vite jalan di :5173 dan Express (API) di :3000.
      // Proxy ini supaya frontend bisa fetch('/api/...') dan fetch('/uploads/...')
      // tanpa perlu CORS / tanpa hardcode http://localhost:3000 di kode.
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist'
  }
});
