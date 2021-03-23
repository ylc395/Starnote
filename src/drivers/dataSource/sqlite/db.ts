import sqlite3 from 'sqlite3';
import { Sequelize } from 'sequelize';
import { IS_DEVELOPMENT, APP_DIRECTORY } from 'drivers/platform/os/constants';
import path from 'path';

if (IS_DEVELOPMENT) {
  sqlite3.verbose();
}

export const db = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(APP_DIRECTORY, 'database.sqlite'),
  // eslint-disable-next-line no-console
  logging: IS_DEVELOPMENT ? console.log : false,
  define: {
    freezeTableName: true,
    underscored: true,
  },
  query: { nest: true },
});

export type Db = Sequelize;
