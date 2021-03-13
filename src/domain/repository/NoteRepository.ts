import dayjs from 'dayjs';
import { singleton, inject } from 'tsyringe';
import { Note, Notebook } from 'domain/entity';
import { emit, Repository } from './BaseRepository';
import type { Dao } from './BaseRepository';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from "./daoTokens";
import { TIME_FORMAT } from 'domain/constant';

@singleton()
export class NoteRepository extends Repository {
  constructor(
     @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
     @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
    ) {
      super()
  }
  queryNoteById(id: Note['id']) {
    return this.noteDao!.one({ id }).then(note =>
      note ? new Note(note) : note,
    );
  }

  @emit('noteCreated')
  createNote(note: Note) {
    this.notebookDao!.update({id: note.notebookId.value, userModifiedAt: dayjs().format(TIME_FORMAT)})
    return this.noteDao!.create(note.toDo());
  }

  @emit('noteUpdated')
  updateNote(note: Note) {
    this.notebookDao!.update({id: note.notebookId.value, userModifiedAt: dayjs().format(TIME_FORMAT)})
    return this.noteDao!.update(note.toDo());
  }
}
