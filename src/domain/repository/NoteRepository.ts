/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { singleton, inject } from 'tsyringe';
import {
  Note,
  isWithId,
  NoteDataObject,
  NotebookDataObject,
} from 'domain/entity';
import type { Dao } from './types';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from './daoTokens';
import { pick } from 'lodash';

@singleton()
export class NoteRepository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<NoteDataObject>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<NotebookDataObject>,
  ) {}
  queryNoteById(id: Note['id']): Promise<Note | null>;
  queryNoteById(
    id: Note['id'],
    fields: (keyof NoteDataObject)[],
  ): Promise<NoteDataObject | null>;
  queryNoteById(id: Note['id'], fields?: (keyof NoteDataObject)[]) {
    if (!fields) {
      return this.noteDao!.one({ id }).then((note) =>
        note ? Note.from(note) : note,
      );
    }

    return this.noteDao!.one({ id }, fields);
  }

  createNote(note: Note) {
    const parent = pick(note.getParent().toDataObject(), [
      'id',
      'userModifiedAt',
    ]);

    if (!isWithId(parent)) {
      throw new Error('wrong parent');
    }

    this.notebookDao!.update(parent);
    this.noteDao!.create(note.toDataObject());
  }

  updateNote<T extends keyof NoteDataObject>(note: Note, fields?: T[]) {
    const payload = fields
      ? pick(note.toDataObject(), [...fields, 'id'])
      : note.toDataObject();

    if (!isWithId(payload)) {
      throw new Error('no noteId when update');
    }

    return this.noteDao!.update(payload);
  }

  deleteNote(note: Note) {
    return this.noteDao!.deleteById(note.id);
  }
}
