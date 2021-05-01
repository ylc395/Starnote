import * as NoteTable from './NoteTable';
import * as NotebookTable from './NotebookTable';
import * as StarTable from './StarTable';
import { createTableIfNotExists, db } from './db';
import type { TableName } from './db';

const createTables = () =>
  Promise.all([
    createTableIfNotExists(NoteTable.TABLE_NAME, NoteTable.builder),
    createTableIfNotExists(NotebookTable.TABLE_NAME, NotebookTable.builder),
    createTableIfNotExists(StarTable.TABLE_NAME, StarTable.builder),
  ]);

export const tablesReady = createTables();

export { db, NoteTable, NotebookTable, StarTable, TableName };
