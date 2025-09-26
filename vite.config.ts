import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/WONDER-LAP/',
  plugins: [react()],
  optimizeDeps: [
    'lucide-react'
  ],
});
