import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Enable this to expose
    port: 4173 // You can keep this or change if needed
  },
  preview: {
    host: true,
    port: 4173
  }
})