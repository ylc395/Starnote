import { NoteDataObject, NotebookDataObject, EntityTypes } from 'domain/entity';
import { DataAccessObject } from './DataAccessObject';
import { NoteTable, NotebookTable } from './table';

export const noteDao = new DataAccessObject<NoteDataObject>(EntityTypes.Note);
export const notebookDao = new DataAccessObject<NotebookDataObject>(
  EntityTypes.Notebook,
  {
    entity: EntityTypes.Note,
    foreignKey: NotebookTable.COLUMNS.INDEX_NOTE_ID,
    reference: NoteTable.COLUMNS.ID,
    as: 'indexNote',
  },
);
