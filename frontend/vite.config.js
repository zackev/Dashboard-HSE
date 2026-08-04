import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Vite jalan di :5173, Laravel API di :8000. Proxy ini membuat
      // permintaan dari browser TERLIHAT same-origin (localhost:5173),
      // jadi cookie sesi Sanctum otomatis tersimpan/terkirim tanpa
      // konfigurasi CORS/credentials tambahan di sisi frontend.
      '/api': 'http://localhost:8000',
      '/sanctum': 'http://localhost:8000',
      '/storage': 'http://localhost:8000'
    }
  },
  build: {
    outDir: 'dist'
  }
});
