import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
        ]
      }
    })
  ],
  esbuild: {
    target: 'es2020',
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'empty-import-meta': 'silent'
    },
    loader: {
      '.tsx': 'jsx',
      '.ts': 'js'
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      onwarn() {
        return;
      }
    },
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
})
