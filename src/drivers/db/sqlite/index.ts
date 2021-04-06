import { container } from 'tsyringe';
import {
  NoteDataObject,
  NotebookDataObject,
  StarDataObject,
  EntityTypes,
} from 'domain/entity';
import {
  NOTE_DAO_TOKEN,
  NOTEBOOK_DAO_TOKEN,
  STAR_DAO_TOKEN,
} from 'domain/repository';
import { DataAccessObject } from './DataAccessObject';
import { NoteTable, NotebookTable, StarTable } from './table';

export { tablesReady } from './table';
export const noteDao = new DataAccessObject<NoteDataObject>(EntityTypes.Note, {
  scope: { valid: 1 },
});
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

export const starDao = new DataAccessObject<StarDataObject>(EntityTypes.Star, {
  belongsTo: {
    entity: EntityTypes.Note,
    foreignKey: StarTable.COLUMNS.ENTITY_ID,
    reference: NoteTable.COLUMNS.ID,
    as: 'entity',
    required: true,
    excludes: ['content'],
    scope: { valid: 1 },
  },
});

container.registerInstance(NOTE_DAO_TOKEN, noteDao);
container.registerInstance(NOTEBOOK_DAO_TOKEN, notebookDao);
container.registerInstance(STAR_DAO_TOKEN, starDao);
