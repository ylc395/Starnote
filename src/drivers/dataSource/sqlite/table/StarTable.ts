import type { TableBuilder } from './db';
import { EntityTypes } from 'domain/entity';

export const TABLE_NAME = EntityTypes.Star;
export const COLUMNS = {
  ID: 'id',
  ENTITY_ID: 'entityId',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
} as const;

export const builder: TableBuilder = (table) => {
  table.uuid(COLUMNS.ID).primary();
  table.uuid(COLUMNS.ENTITY_ID).notNullable();
  table.integer(COLUMNS.SORT_ORDER).notNullable();
  table.dateTime(COLUMNS.USER_CREATED_AT).notNullable();
};
