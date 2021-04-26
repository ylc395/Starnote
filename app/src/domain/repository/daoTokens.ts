import { InjectionToken } from 'tsyringe';
import type { Dao } from './types';
import type {
  NoteDataObject,
  NotebookDataObject,
  StarDataObject,
} from 'domain/entity';

export const NOTE_DAO_TOKEN: InjectionToken<Dao<NoteDataObject>> = Symbol();
export const NOTEBOOK_DAO_TOKEN: InjectionToken<
  Dao<NotebookDataObject>
> = Symbol();
export const STAR_DAO_TOKEN: InjectionToken<Dao<StarDataObject>> = Symbol();
