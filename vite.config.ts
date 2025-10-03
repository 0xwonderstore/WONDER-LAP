import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs/dev/config/
export default defineConfig({
  base: '/WONDER-LAP/',
  plugins: [react()],
  optimizeDeps: {
    include: [
      'lucide-react',
      '@workday/canvas-kit-react',
      '@workday/canvas-kit-react/pagination',
      '@workday/canvas-kit-react/text-input',
      '@workday/canvas-kit-react/style'
    ]
  },
});
