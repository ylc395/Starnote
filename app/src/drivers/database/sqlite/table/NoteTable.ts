import notebookTable from './notebookTable';
import { EntityTypes } from 'domain/entity';
import type { Table } from './db';

const COLUMNS = {
  ID: 'id',
  TITLE: 'title',
  CONTENT: 'content',
  PARENT_ID: 'parentId',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
  USER_MODIFIED_AT: 'userModifiedAt',
} as const;

const table: Table = {
  name: EntityTypes.Note,
  columns: COLUMNS,
  builder: (table) => {
    table.uuid(COLUMNS.ID).primary();
    table.text(COLUMNS.TITLE).notNullable();
    table.text(COLUMNS.CONTENT).notNullable();
    table.uuid(COLUMNS.PARENT_ID).notNullable();
    table
      .foreign(COLUMNS.PARENT_ID)
      .references(notebookTable.columns.ID)
      .inTable(notebookTable.name);
    table.integer(COLUMNS.SORT_ORDER).notNullable();
    table.dateTime(COLUMNS.USER_CREATED_AT).notNullable();
    table.dateTime(COLUMNS.USER_MODIFIED_AT).notNullable();
    table.unique([COLUMNS.PARENT_ID, COLUMNS.TITLE]);
  },
};

export default table;
