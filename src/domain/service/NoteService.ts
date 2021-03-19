import { Note, Notebook } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';

const noteRepository = container.resolve(NoteRepository);

export class NoteService {
  static createEmptyNote(parent: Notebook) {
    const newNote = Note.from({
      parentId: parent.id,
      title: 'untitled note',
      content: '',
    });
    return noteRepository.createNote(newNote);
  }
}
