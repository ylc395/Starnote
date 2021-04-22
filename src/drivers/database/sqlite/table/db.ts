import knex from 'knex';
import { IS_DEVELOPMENT } from 'utils/env';
import { APP_DIRECTORY } from 'drivers/electron/constants';
import path from 'path';
import { EntityTypes } from 'domain/entity';

export const db = knex({
  client: 'sqlite3',
  connection: () => ({ filename: path.join(APP_DIRECTORY, 'database.sqlite') }),
  debug: IS_DEVELOPMENT,
  asyncStackTraces: IS_DEVELOPMENT,
  useNullAsDefault: true,
});

export type TableBuilder = Parameters<typeof db['schema']['createTable']>[1];
export const createTableIfNotExists = (
  tableName: EntityTypes,
  callback: TableBuilder,
) => {
  return db.schema.hasTable(tableName).then((existed) => {
    if (existed) {
      return;
    }

    return db.schema.createTable(tableName, callback).then();
  });
};
