import type { Table } from './db';
import { EntityTypes } from 'domain/entity';

export const COLUMNS = {
  ID: 'id',
  ENTITY_ID: 'entityId',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
} as const;

const table: Table = {
  name: EntityTypes.Star,
  columns: COLUMNS,
  builder: (table) => {
    table.uuid(COLUMNS.ID).primary();
    table.uuid(COLUMNS.ENTITY_ID).notNullable();
    table.integer(COLUMNS.SORT_ORDER).notNullable();
    table.dateTime(COLUMNS.USER_CREATED_AT).notNullable();
    table.unique([COLUMNS.ENTITY_ID]);
  },
};

export default table;
