import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_TARGET || `http://localhost:${process.env.PORT || 5000}`

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT || 5173),
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
