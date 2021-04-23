const WorkerPlugin = require('worker-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  pages: {
    index: {
      entry: 'src/drivers/web/main.ts',
      template: 'src/drivers/web/assets/index.html',
    },
  },
  configureWebpack: {
    target: process.env.IS_ELECTRON ? 'electron-renderer' : 'web',
    resolve: { plugins: [new TsconfigPathsPlugin()] },
    plugins: [
      new WorkerPlugin(),
      new CopyPlugin([
        { from: 'wasm-git/*.@(js|wasm)', context: 'node_modules' },
      ]),
    ],
    externals: {
      knex: 'commonjs knex',
    },
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.resolve.plugin('tsPath').use(TsconfigPathsPlugin);
      },
      mainProcessFile: 'src/drivers/electron/main.ts',
      mainProcessWatch: ['src/drivers/electron/*'],
      mainProcessArgs: ['--arg-name', 'arg-value'],
    },
  },
};
