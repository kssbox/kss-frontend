import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export const createViteConfig = (options = {}) => {
  return defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
    ...options,
  })
}

export default createViteConfig()
