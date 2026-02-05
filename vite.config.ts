import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Changed from '/WONDER-LAP/' to '/' for standard hosting
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: [
    'lucide-react',
    'date-fns',
    'recharts',
    'react-day-picker',
    'zustand',
    '@tanstack/react-query'
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand', '@tanstack/react-query'],
          ui: ['lucide-react', 'react-day-picker', 'framer-motion'],
          charts: ['recharts'],
          utils: ['date-fns']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
