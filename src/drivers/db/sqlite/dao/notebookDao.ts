import { DataAccessObject } from './DataAccessObject';
import { NotebookDataObject, EntityTypes } from 'domain/entity';
import { NoteTable, NotebookTable } from '../table';

export const notebookDao = new DataAccessObject<NotebookDataObject>(
  EntityTypes.Notebook,
  {
    belongsTo: {
      entity: EntityTypes.Note,
      foreignKey: NotebookTable.COLUMNS.INDEX_NOTE_ID,
      reference: NoteTable.COLUMNS.ID,
      as: 'indexNote',
      excludes: ['content'],
      scope: { valid: 1 },
    },
    hasMany: [
      {
        entity: EntityTypes.Notebook,
        foreignKey: 'parentId',
      },
      {
        entity: EntityTypes.Note,
        foreignKey: 'parentId',
      },
    ],
    scope: { valid: 1 },
  },
);
