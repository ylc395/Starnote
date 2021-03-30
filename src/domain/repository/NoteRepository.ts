/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { singleton, inject } from 'tsyringe';
import {
  Note,
  isWithId,
  NoteDo,
  NotebookDo,
  ObjectWithId,
} from 'domain/entity';
import type { Dao } from './types';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from './daoTokens';
import { has, isNil, omitBy, pick } from 'lodash';

@singleton()
export class NoteRepository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<NoteDo>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<NotebookDo>,
  ) {}
  queryNoteById(id: Note['id']): Promise<Note | null>;
  queryNoteById(
    id: Note['id'],
    fields: (keyof NoteDo)[],
  ): Promise<NoteDo | null>;
  queryNoteById(id: Note['id'], fields?: (keyof NoteDo)[]) {
    if (!fields) {
      return this.noteDao!.one({ id }).then((note) =>
        note ? Note.from(note) : note,
      );
    }

    return this.noteDao!.one({ id }, fields);
  }

  createNote(note: Note) {
    this.notebookDao!.update(
      pick(note.getParent()!.toDo(), ['id', 'userModifiedAt']) as ObjectWithId,
    );
    this.noteDao!.create(note.toDo());
  }

  updateNote(note: Note, fields?: (keyof NoteDo)[]) {
    const payload = omitBy(
      fields
        ? (pick(note.toDo(), [...fields, 'id']) as NoteDo & ObjectWithId)
        : note.toDo(),
      isNil,
    );

    if (!isWithId(payload)) {
      throw new Error('no noteId when update');
    }

    if (has(payload, 'title') || has(payload, 'content')) {
      this.notebookDao!.update(
        pick(note.getParent()!.toDo(), [
          'id',
          'userModifiedAt',
        ]) as ObjectWithId,
      );
    }

    return this.noteDao!.update(payload);
  }

  deleteNote(note: Note) {
    return this.noteDao!.deleteById(note.id);
  }
}
