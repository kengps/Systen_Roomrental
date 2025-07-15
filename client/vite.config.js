import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindConfig from './tailwind.config'
//import tailwindcss from '@tailwindcss/vite'

tailwindConfig
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 8001,
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: 'node_modules/$1',
      },
    ],

  },
})
