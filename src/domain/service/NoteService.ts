import { Note, Notebook, NoteDo } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';

const noteRepository = container.resolve(NoteRepository);

export class NoteService {
  static async loadContent(note: Note) {
    const noteDo = await noteRepository.queryNoteById(note.id, ['content']);

    if (!noteDo) {
      throw new Error(`no note(${note.id}) to load content`);
    }

    note.content.value = noteDo.content ?? '';
  }

  static createEmptyNote(
    parent: Notebook,
    parentSynced: boolean,
    note: NoteDo = {},
  ) {
    const newNote = Note.from(
      {
        title: 'untitled note',
        content: '',
        ...note,
        ...(parentSynced ? null : { parentId: parent.id }),
      },
      parentSynced ? parent : undefined,
    );
    return noteRepository.createNote(newNote);
  }
}
