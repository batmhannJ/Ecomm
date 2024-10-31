import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT || 5173, // Use the PORT from environment or fallback to 4173
  },
  preview: {
    host: true,
    port: process.env.PORT || 5173
  }
})