import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Em desenvolvimento, /api e /hubs são repassados para a API .NET (porta 5080).
// No build, a loja é gerada dentro do wwwroot da API: um único servidor entrega loja + painel + API.
const api = process.env.VITE_API_PROXY ?? 'http://localhost:5080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: api, changeOrigin: true },
      '/hubs': { target: api, changeOrigin: true, ws: true },
    },
  },
  build: {
    outDir: '../src/VinoBebidas.Api/wwwroot',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
  },
})
