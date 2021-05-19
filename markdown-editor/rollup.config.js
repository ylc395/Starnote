import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';

export default {
  input: './src/index.ts',
  output: {
    dir: './dist',
    sourcemap: true,
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    nodeResolve(),
    typescript(),
    postcss({ extract: true, modules: true }),
    svg(),
  ],
};
