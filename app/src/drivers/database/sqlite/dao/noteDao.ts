import { DataAccessObject } from './DataAccessObject';
import { NoteDataObject } from 'domain/entity';
import { NoteTable } from '../table';

export const noteDao = new DataAccessObject<NoteDataObject>({
  name: NoteTable.TABLE_NAME,
  columns: NoteTable.COLUMNS,
});
