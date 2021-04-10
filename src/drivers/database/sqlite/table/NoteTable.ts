import type { TableBuilder } from './db';
import { COLUMNS as NOTEBOOK_COLUMNS } from './NotebookTable';
import { EntityTypes } from 'domain/entity';

export const TABLE_NAME = EntityTypes.Note;
export const COLUMNS = {
  ID: 'id',
  TITLE: 'title',
  CONTENT: 'content',
  PARENT_ID: 'parentId',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
  USER_MODIFIED_AT: 'userModifiedAt',
} as const;

export const builder: TableBuilder = (table) => {
  table.uuid(COLUMNS.ID).primary();
  table.text(COLUMNS.TITLE).notNullable();
  table.text(COLUMNS.CONTENT).notNullable();
  table.uuid(COLUMNS.PARENT_ID).notNullable();
  table
    .foreign(COLUMNS.PARENT_ID)
    .references(NOTEBOOK_COLUMNS.ID)
    .inTable(EntityTypes.Notebook);
  table.integer(COLUMNS.SORT_ORDER).notNullable();
  table.dateTime(COLUMNS.USER_CREATED_AT).notNullable();
  table.dateTime(COLUMNS.USER_MODIFIED_AT).notNullable();
  table.unique([COLUMNS.PARENT_ID, COLUMNS.TITLE]);
};
