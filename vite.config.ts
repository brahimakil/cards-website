import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'empty-import-meta': 'silent'
    },
    legalComments: 'none'
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all warnings
        return;
      }
    },
    minify: 'esbuild'
  },
  server: {
    hmr: {
      overlay: false // Disable error overlay
    }
  },
  optimizeDeps: {
    exclude: ['eslint']
  }
})
