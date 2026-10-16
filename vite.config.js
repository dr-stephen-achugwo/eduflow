// https://vite.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://eduflow.apps.net.ng',
        changeOrigin: false,
        ws: true,
      },
      '/uploads': {
        target: 'https://eduflow.apps.net.ng',
        changeOrigin: false,
      },
      '/socket.io': {
        target: 'https://eduflow.apps.net.ng',
        changeOrigin: false,
        ws: true,
      },
    },
  },
});
