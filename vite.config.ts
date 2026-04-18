/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula un navegador en la terminal
    globals: true, // Nos permite usar describe, it, expect sin importarlos en cada archivo
    setupFiles: './src/setupTests.ts', // Archivo de configuración previa
  }
})
