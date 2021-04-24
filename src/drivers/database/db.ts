import type {
  NoteDataObject,
  NotebookDataObject,
  StarDataObject,
} from 'domain/entity';
import type { Dao } from 'domain/repository';

export declare const tablesReady: Promise<void>;
export declare const noteDao: Dao<NoteDataObject>;
export declare const notebookDao: Dao<NotebookDataObject>;
export declare const starDao: Dao<StarDataObject>;
