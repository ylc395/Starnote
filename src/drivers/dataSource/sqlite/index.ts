import {
  NoteDataObject,
  NotebookDataObject,
  StarDataObject,
  EntityTypes,
} from 'domain/entity';
import { DataAccessObject } from './DataAccessObject';
import { NoteTable, NotebookTable, StarTable } from './table';

export const noteDao = new DataAccessObject<NoteDataObject>(EntityTypes.Note);
export const notebookDao = new DataAccessObject<NotebookDataObject>(
  EntityTypes.Notebook,
  {
    entity: EntityTypes.Note,
    foreignKey: NotebookTable.COLUMNS.INDEX_NOTE_ID,
    reference: NoteTable.COLUMNS.ID,
    as: 'indexNote',
    excludes: ['content'],
  },
);

export const starDao = new DataAccessObject<StarDataObject>(EntityTypes.Star, {
  entity: EntityTypes.Note,
  foreignKey: StarTable.COLUMNS.ENTITY_ID,
  reference: NoteTable.COLUMNS.ID,
  as: 'entity',
  excludes: ['content'],
});
