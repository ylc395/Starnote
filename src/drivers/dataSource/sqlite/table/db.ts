import knex from 'knex';
import { IS_DEVELOPMENT, APP_DIRECTORY } from 'drivers/platform/os/constants';
import path from 'path';

export const db = knex({
  client: 'sqlite3',
  connection: () => ({
    filename: path.join(APP_DIRECTORY, 'database.sqlite'),
  }),
  debug: IS_DEVELOPMENT,
  asyncStackTraces: IS_DEVELOPMENT,
  useNullAsDefault: true,
});
