import { EntityTypes, SortByEnums, SortDirectEnums } from 'domain/entity';
import type { Table } from './db';
import noteTable from './noteTable';

const COLUMNS = {
  ID: 'id',
  TITLE: 'title',
  SORT_BY: 'sortBy',
  PARENT_ID: 'parentId',
  INDEX_NOTE_ID: 'indexNoteId',
  SORT_DIRECT: 'sortDirect',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
  USER_MODIFIED_AT: 'userModifiedAt',
} as const;

const table: Table = {
  name: EntityTypes.Notebook,
  columns: COLUMNS,
  builder: (table) => {
    table.uuid(COLUMNS.ID).primary();
    table.text(COLUMNS.TITLE).notNullable();
    table
      .enum(COLUMNS.SORT_BY, [
        SortByEnums.Default,
        SortByEnums.Title,
        SortByEnums.CreatedAt,
        SortByEnums.UpdatedAt,
        SortByEnums.Custom,
      ])
      .notNullable();
    table.uuid(COLUMNS.PARENT_ID);
    table.uuid(COLUMNS.INDEX_NOTE_ID);
    table
      .foreign(COLUMNS.INDEX_NOTE_ID)
      .references(noteTable.columns.ID)
      .inTable(noteTable.name);
    table
      .enum(COLUMNS.SORT_DIRECT, [
        SortDirectEnums.Asc,
        SortDirectEnums.Desc,
        SortDirectEnums.Default,
      ])
      .notNullable();
    table.integer(COLUMNS.SORT_ORDER).notNullable();
    table.dateTime(COLUMNS.USER_CREATED_AT).notNullable();
    table.dateTime(COLUMNS.USER_MODIFIED_AT).notNullable();
    table.unique([COLUMNS.PARENT_ID, COLUMNS.TITLE]);
  },
};

export default table;
