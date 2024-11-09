import config from '../../rollup.config.mjs';
import { defineConfig } from 'rollup';

export default defineConfig({
  ...config,
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  external: []
});
