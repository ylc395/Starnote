import { DataAccessObject } from './DataAccessObject';
import { NoteDataObject } from 'domain/entity';
import { noteTable } from '../table';

export const noteDao = new DataAccessObject<NoteDataObject>(noteTable);
