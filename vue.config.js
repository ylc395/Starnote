const path = require('path');
const webAppEntry = 'src/drivers/ui/web/main.ts';
const alias = {
  domain: path.resolve(__dirname, 'src/domain'),
  drivers: path.resolve(__dirname, 'src/drivers'),
  utils: path.resolve(__dirname, 'src/utils'),
};

module.exports = {
  pages: {
    index: {
      entry: webAppEntry,
      template: 'src/drivers/ui/web/assets/index.html',
    },
  },
  configureWebpack: {
    resolve: { alias },
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/drivers/ui/electron/preload.ts',
      chainWebpackMainProcess: config => {
        Object.keys(alias).forEach(key => {
          config.resolve.alias.set(key, alias[key]);
        });
      },
      // @see https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/578#issuecomment-561972824
      externals: ['sequelize'],
      mainProcessFile: 'src/drivers/ui/electron/main.ts',
      mainProcessWatch: ['src/drivers/ui/electron/*'],
      mainProcessArgs: ['--arg-name', 'arg-value'],
    },
  },
};
