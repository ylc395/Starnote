const path = require('path');
const WorkerPlugin = require('worker-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const alias = {
  domain: path.resolve(__dirname, 'src/domain'),
  drivers: path.resolve(__dirname, 'src/drivers'),
  utils: path.resolve(__dirname, 'src/utils'),
};

module.exports = {
  pages: {
    index: {
      entry: 'src/drivers/web/main.ts',
      template: 'src/drivers/web/assets/index.html',
    },
  },
  chainWebpack(config) {
    config
      .plugin('copy')
      .use(CopyPlugin)
      .tap((args) => {
        args[0] = [{ from: 'wasm-git/*.@(js|wasm)', context: 'node_modules' }];
        return args;
      });
  },
  configureWebpack: {
    target: process.env.IS_ELECTRON ? 'electron-renderer' : 'web',
    resolve: { alias },
    plugins: [new WorkerPlugin()],
    externals: {
      knex: 'commonjs knex',
    },
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        Object.keys(alias).forEach((key) => {
          config.resolve.alias.set(key, alias[key]);
        });
      },
      mainProcessFile: 'src/drivers/electron/main.ts',
      mainProcessWatch: ['src/drivers/electron/*'],
      mainProcessArgs: ['--arg-name', 'arg-value'],
    },
  },
};
