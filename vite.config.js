import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Production build optimizasyonları
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          // Lucide icons chunk
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons'
          }
          // Diğer node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // Minification optimizasyonları
    minify: 'esbuild', // terser yerine esbuild kullan (daha hızlı)
    // Source map sadece development'ta
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})

