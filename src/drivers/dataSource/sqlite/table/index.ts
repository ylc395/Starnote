import * as NoteTable from './NoteTable';
import * as NotebookTable from './NotebookTable';
import { IS_DEVELOPMENT } from 'drivers/platform/common/constants';
import { db } from './db';
import { EntityTypes } from 'domain/entity';

const createTables = () => {
  NoteTable.table.then();
  NotebookTable.table.then();
};

if (IS_DEVELOPMENT) {
  Promise.all([
    db.schema.dropTableIfExists(EntityTypes.Note).then(),
    db.schema.dropTableIfExists(EntityTypes.Notebook).then(),
  ]).then(createTables);
} else {
  createTables();
}

export { db, NoteTable, NotebookTable };
