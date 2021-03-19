import { Note, Notebook } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';

const noteRepository = container.resolve(NoteRepository);

export class NoteService {
  static createEmptyNote(parent: Notebook, parentSynced: boolean) {
    const newNote = Note.from(
      {
        title: 'untitled note',
        content: '',
        ...(parentSynced ? null : { parentId: parent.id }),
      },
      parentSynced ? parent : undefined,
    );
    return noteRepository.createNote(newNote);
  }
}
