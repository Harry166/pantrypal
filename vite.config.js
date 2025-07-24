import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    // This ensures that environment variables are properly replaced during build
    'process.env': {}
  },
  // Set the base URL for GitHub Pages
  // Replace 'PantryPal' with your repository name
  base: process.env.NODE_ENV === 'production' ? '/PantryPal/' : '/'
})
