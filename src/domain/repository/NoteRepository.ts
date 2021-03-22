/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { singleton, inject } from 'tsyringe';
import { Note, Notebook, isWithId, NoteDo } from 'domain/entity';
import { Repository, emit } from './BaseRepository';
import type { Dao } from './BaseRepository';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from './daoTokens';
import { TIME_FORMAT } from 'domain/constant';
import { isNil, omitBy } from 'lodash';

@singleton()
export class NoteRepository extends Repository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
  ) {
    super();
  }
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

  @emit('noteCreated')
  async createNote(note: Note) {
    this.notebookDao!.update({
      id: note.parentId.value,
      userModifiedAt: note.userCreatedAt.value.format(TIME_FORMAT),
    });
    await this.noteDao!.create(note.toDo());

    return note;
  }

  updateNote(note: Note) {
    const noteDo = omitBy(note.toDo(), isNil) as NoteDo;

    if (!isWithId(noteDo)) {
      throw new Error('no noteId when update');
    }

    this.notebookDao!.update({
      id: note.parentId.value,
      userModifiedAt: note.userModifiedAt.value.format(TIME_FORMAT),
    });

    return this.noteDao!.update(noteDo);
  }
}
