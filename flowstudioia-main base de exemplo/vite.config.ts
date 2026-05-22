import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite' // <-- Adicione esta importação
import path from 'path'

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    netlify(),
    tailwindcss(), // <-- Adicione o plugin aqui
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
