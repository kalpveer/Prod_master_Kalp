import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/stackai': {
        target: 'https://api.stackai.com',
        changeOrigin: true,
        rewrite: () => '/inference/v0/run/82daafa8-4b94-431b-989d-d482e0c29e95/69d556e109f5613fdf74a15b',
      },
    },
  },
})
