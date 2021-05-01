import knex, { Knex } from 'knex';
import { IS_DEVELOPMENT } from 'utils/env';
import { APP_DIRECTORY } from 'drivers/electron/constants';
import logger from 'drivers/logger';
import path from 'path';
import { EntityTypes } from 'domain/entity';

type TableBuilder = (builder: Knex.CreateTableBuilder) => unknown;

export const db = knex({
  client: 'sqlite3',
  connection: () => ({ filename: path.join(APP_DIRECTORY, 'database.sqlite') }),
  debug: IS_DEVELOPMENT,
  asyncStackTraces: IS_DEVELOPMENT,
  useNullAsDefault: true,
  log: {
    warn: logger.warn.bind(logger, 'sqlite'),
    error: logger.error.bind(logger, 'sqlite'),
    debug: logger.debug.bind(logger, 'sqlite'),
    deprecate: logger.info.bind(logger, 'sqlite'),
  },
});

export type TableName = EntityTypes;
export const createTableIfNotExists = (
  tableName: TableName,
  callback: TableBuilder,
) => {
  return db.schema.hasTable(tableName).then((existed) => {
    if (existed) {
      return;
    }

    return db.schema.createTable(tableName, callback).then();
  });
};

export interface Table {
  readonly name: EntityTypes;
  readonly columns: Record<string, string>;
  readonly builder: TableBuilder;
}
