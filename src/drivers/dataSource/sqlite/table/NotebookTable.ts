import { EntityTypes, SortByEnums, SortDirectEnums } from 'domain/entity';
import { db } from './db';
import { COLUMNS as NOTE_COLUMNS } from './NoteTable';

const TABLE_NAME = EntityTypes.Notebook;
export const COLUMNS = {
  ID: 'id',
  VALID: 'valid',
  TITLE: 'title',
  SORT_BY: 'sortBy',
  PARENT_ID: 'parentId',
  INDEX_NOTE_ID: 'indexNoteId',
  SORT_DIRECT: 'sortDirect',
  SORT_ORDER: 'sortOrder',
  USER_CREATED_AT: 'userCreatedAt',
  USER_MODIFIED_AT: 'userModifiedAt',
} as const;

export const table = db.schema.createTableIfNotExists(TABLE_NAME, (table) => {
  table.uuid(COLUMNS.ID).primary();
  table.enum(COLUMNS.VALID, [0, 1]).notNullable().defaultTo(1);
  table.text(COLUMNS.TITLE).notNullable();
  table
    .enum(COLUMNS.SORT_BY, [
      SortByEnums.Default,
      SortByEnums.Title,
      SortByEnums.CreatedAt,
      SortByEnums.UpdatedAt,
      SortByEnums.Default,
    ])
    .notNullable();
  table.uuid(COLUMNS.PARENT_ID);
  table.uuid(COLUMNS.INDEX_NOTE_ID);
  table
    .foreign(COLUMNS.INDEX_NOTE_ID)
    .references(NOTE_COLUMNS.ID)
    .inTable(EntityTypes.Note);
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
});
