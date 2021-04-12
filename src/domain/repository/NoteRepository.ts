import { singleton, container } from 'tsyringe';
import { Note, isWithId, NoteDataObject } from 'domain/entity';
import { NOTE_DAO_TOKEN } from './daoTokens';
import { pick } from 'lodash';

@singleton()
export class NoteRepository {
  private readonly noteDao = container.resolve(NOTE_DAO_TOKEN);
  queryNoteById(id: Note['id']): Promise<Note | null>;
  queryNoteById(
    id: Note['id'],
    fields: (keyof NoteDataObject)[],
  ): Promise<NoteDataObject | null>;
  queryNoteById(id: Note['id'], fields?: (keyof NoteDataObject)[]) {
    if (!fields) {
      return this.noteDao
        .one({ id })
        .then((note) => (note ? Note.from(note) : note));
    }

    return this.noteDao.one({ id }, fields);
  }

  createNote(note: Note) {
    return this.noteDao.create(note.toDataObject());
  }

  updateNote<T extends keyof NoteDataObject>(note: Note, fields?: T[]) {
    const payload = fields
      ? pick(note.toDataObject(), [...fields, 'id'])
      : note.toDataObject();

    if (!isWithId(payload)) {
      throw new Error('no noteId when update');
    }

    return this.noteDao.update(payload);
  }

  deleteNote(note: Note) {
    return this.noteDao.deleteById(note.id);
  }
}
