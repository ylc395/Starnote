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
    postcss({
      extract: true,
      // if `modules` is not `true`, `autoModule` must be set as false, or module css files' name must end with .module.css (which we prefer)
      // @see https://github.com/egoist/rollup-plugin-postcss#automodules
      // @see https://github.com/egoist/rollup-plugin-postcss/blob/a03c7bfc18b1d3275fd760d5c15030880891a9b9/src/postcss-loader.js#L77
      modules: { generateScopedName: '[local]__[hash:base64:7]' },
    }),
    svg(),
  ],
};
