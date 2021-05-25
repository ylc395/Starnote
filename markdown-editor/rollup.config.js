import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default {
  input: './src/index.ts',
  output: {
    dir: './dist',
    sourcemap: true,
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    commonjs(),
    nodeResolve(),
    typescript(),
    postcss({ extract: true, modules: true }),
    svg(),
  ],
};
