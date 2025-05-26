import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Check if SSL certificates exist, otherwise use HTTP
const sslKeyPath = path.resolve(__dirname, './ssl/key.pem')
const sslCertPath = path.resolve(__dirname, './ssl/cert.pem')
const useHttps = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['exceljs'],
    exclude: ['@radix-ui/react-toast'],
    force: true
  },
  server: {
    // Use HTTPS if certificates exist
    https: useHttps ? {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    } : false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Use IPv4 instead of IPv6
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://127.0.0.1:5000',
        ws: true,
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