import { DataAccessObject } from './DataAccessObject';
import { NotebookDataObject } from 'domain/entity';
import { noteTable, notebookTable } from '../table';

export const notebookDao = new DataAccessObject<NotebookDataObject>(
  notebookTable,
  {
    belongsTo: {
      table: noteTable,
      foreignKey: notebookTable.columns.INDEX_NOTE_ID,
      reference: noteTable.columns.ID,
      as: 'indexNote',
      excludes: ['content'],
    },
    hasMany: [
      {
        table: notebookTable,
        foreignKey: 'parentId',
      },
      {
        table: noteTable,
        foreignKey: 'parentId',
      },
    ],
  },
);
