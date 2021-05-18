import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './src/index.ts',
  output: {
    dir: './dist',
    sourcemap: true,
  },
  external: [/node_modules/],
  plugins: [typescript(), nodeResolve()],
};
