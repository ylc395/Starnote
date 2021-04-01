import * as NoteTable from './NoteTable';
import * as NotebookTable from './NotebookTable';
import * as StarTable from './StarTable';
import { IS_DEVELOPMENT } from 'drivers/platform/common/constants';
import { createTableIfNotExists, db } from './db';

const createTables = () =>
  Promise.all([
    createTableIfNotExists(NoteTable.TABLE_NAME, NoteTable.builder),
    createTableIfNotExists(NotebookTable.TABLE_NAME, NotebookTable.builder),
    createTableIfNotExists(StarTable.TABLE_NAME, StarTable.builder),
  ]);

if (IS_DEVELOPMENT) {
  Promise.all([
    db.schema.dropTableIfExists(NoteTable.TABLE_NAME).then(),
    db.schema.dropTableIfExists(NotebookTable.TABLE_NAME).then(),
    db.schema.dropTableIfExists(StarTable.TABLE_NAME).then(),
  ]).then(createTables);
} else {
  createTables();
}

export { db, NoteTable, NotebookTable, StarTable };
