import { defineConfig } from 'tsup'
import { copyFileSync, cpSync } from 'fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    entry: ['src/index.ts'],
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  banner: {
    js: '"use client"',
  },
  // @ts-expect-error
  onSuccess() {
    // Copy the new layered theme system files
    copyFileSync('src/styles/base.css', 'dist/base.css')
    copyFileSync('src/styles/globals.css', 'dist/globals.css')
    copyFileSync('src/styles/sonner-theme.css', 'dist/sonner-theme.css')
    // Copy the new flat themes directory
    cpSync('src/styles/themes', 'dist/themes', { recursive: true })
    // Copy locale files
    cpSync('src/locales', 'dist/locales', { recursive: true })
  },
})
