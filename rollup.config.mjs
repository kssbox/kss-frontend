import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import del from 'rollup-plugin-delete';
import postcss from 'rollup-plugin-postcss';
import svgr from '@svgr/rollup';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      preserveModules: true,
      preserveModulesRoot: 'src',
      dir: 'es/',
      format: 'esm'
    }
  ],
  plugins: [
    peerDepsExternal({ useTsconfigDeclarationDir: true }),
    url(),
    svgr({
      icon: true
    }),
    del({ targets: ['dist/*', 'es/*'] }),
    uglify(),
    commonjs(),
    typescript(),
    json(),
    postcss({ extract: 'style.css' })
  ]
});
