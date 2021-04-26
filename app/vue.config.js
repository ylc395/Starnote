const WorkerPlugin = require('worker-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ImplResolver = require('./build/ImplResolverPlugin');

const isElectron = process.env.IS_ELECTRON;
const driverResolver = {
  'src/drivers/database/db': isElectron ? './sqlite' : '',
  'src/drivers/git/git': isElectron ? './FsGit' : '',
  'src/drivers/logger/logger': isElectron ? './FsLogger' : '',
};

module.exports = {
  pages: {
    index: {
      entry: 'src/drivers/web/main.ts',
      template: 'src/drivers/web/assets/index.html',
    },
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('autoprefixer')(),
          require('tailwindcss')(
            require('./src/drivers/web/tailwind.config.js'),
          ),
        ],
      },
    },
  },
  configureWebpack: {
    target: process.env.IS_ELECTRON ? 'electron-renderer' : 'web',
    resolve: {
      plugins: [new TsconfigPathsPlugin(), new ImplResolver(driverResolver)],
    },
    plugins: [
      new WorkerPlugin(),
      new CopyPlugin([
        { from: 'wasm-git/*.@(js|wasm)', context: '../node_modules' },
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
        config.resolve
          .plugin('implResolver')
          .use(ImplResolver, [driverResolver]);
      },
      nodeModulesPath: ['../node_modules', './node_modules'], // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/170
      mainProcessFile: 'src/drivers/electron/main.ts',
      mainProcessWatch: ['src/drivers/electron/*'],
      mainProcessArgs: ['--arg-name', 'arg-value'],
    },
  },
};
