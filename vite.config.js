import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  base: "./",
  build: {
    outDir: "react-dist"
  },
  server: {
    port: 5123,
    strictPort: true
  },
  safelist: [
    {
      pattern: /ant-select-dropdown.*/,
    },
  ],
})
