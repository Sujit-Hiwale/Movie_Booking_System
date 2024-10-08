import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

export default defineConfig({
  plugins: [react()],
  server: {
    port : 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  define:{
    'process.env':process.env,
  },
})
