import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // यह '@' को सीधे 'src' फोल्डर से लिंक करता है
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600, // बड़े पैकेज होने पर Vercel को वार्निंग देने से रोकता है
  },
  define: {
    // Vercel पर "process is not defined" एरर को रोकने के लिए
    'process.env': {},
  },
});
