import { DataAccessObject } from './DataAccessObject';
import { NoteDataObject, EntityTypes } from 'domain/entity';

export const noteDao = new DataAccessObject<NoteDataObject>(EntityTypes.Note, {
  scope: { valid: 1 },
});
