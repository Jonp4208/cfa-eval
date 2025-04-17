import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Use IPv4 instead of IPv6
        changeOrigin: true,
        secure: false,
      }
    },
    cors: true
  },
  build: {
    sourcemap: true, // Enable source maps for better debugging
    target: 'esnext', // Use the latest ECMAScript features
    rollupOptions: {
      output: {
        format: 'es' // Use ES modules
      }
    }
  }
})