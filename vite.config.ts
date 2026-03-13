import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: [
      'nonverminous-joyce-superrespectably.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ]
  }
})
