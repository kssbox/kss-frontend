import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { createViteConfig } from '@kssbox/build-config/vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default createViteConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
      '@kssbox/ui': path.resolve(dirname, '../../packages/ui/src/index.ts'),
    },
  },
})
