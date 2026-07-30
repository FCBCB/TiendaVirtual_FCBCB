// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base:"/TiendaVirtual_FCBCB",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy para tu API local (si existe)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para la API de eventos - RUTA CORREGIDA
      '/api-eventos': {
        target: 'http://agendacultural.fcbcb.gob.bo',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-eventos/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', proxyReq.path);
          });
        },
      },
      // Proxy para gateway2.php - RUTA CORREGIDA
      '/gateway-eventos': {
        target: 'http://agendacultural.fcbcb.gob.bo',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/gateway-eventos/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying gateway request to:', proxyReq.path);
          });
        },
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
})