import { DataAccessObject } from './DataAccessObject';
import { NotebookDataObject } from 'domain/entity';
import { NoteTable, NotebookTable } from '../table';

export const notebookDao = new DataAccessObject<NotebookDataObject>(
  { name: NotebookTable.TABLE_NAME, columns: NotebookTable.COLUMNS },
  {
    belongsTo: {
      entity: NoteTable.TABLE_NAME,
      foreignKey: NotebookTable.COLUMNS.INDEX_NOTE_ID,
      reference: NoteTable.COLUMNS.ID,
      as: 'indexNote',
      columns: NoteTable.COLUMNS,
      excludes: ['content'],
    },
    hasMany: [
      {
        entity: NotebookTable.TABLE_NAME,
        foreignKey: 'parentId',
      },
      {
        entity: NoteTable.TABLE_NAME,
        foreignKey: 'parentId',
      },
    ],
  },
);
