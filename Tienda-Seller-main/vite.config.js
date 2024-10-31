import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/seller/', // i-update ang base URL ayon sa deployment path sa Render
  plugins: [react()],
  server: {
    host: true, // Enable this to expose
    port: 5173 // You can keep this or change if needed
  }
})
