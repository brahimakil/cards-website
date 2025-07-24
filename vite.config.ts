import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      onwarn() {
        return;
      }
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
})
