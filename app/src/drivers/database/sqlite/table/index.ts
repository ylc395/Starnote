import noteTable from './noteTable';
import notebookTable from './notebookTable';
import starTable from './starTable';
import { db, createTableIfNotExists } from './db';
import type { TableName, Table } from './db';

const createTables = () =>
  Promise.all([
    createTableIfNotExists(noteTable.name, noteTable.builder),
    createTableIfNotExists(notebookTable.name, notebookTable.builder),
    createTableIfNotExists(starTable.name, starTable.builder),
  ]);

export const tablesReady = createTables();

export { db, TableName, Table, noteTable, notebookTable, starTable };
