import { Note, Notebook, NoteDo } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';
import { isNull } from 'lodash';
import { EditorService } from './EditorService';

export const token = Symbol();

export class NoteService {
  constructor(private readonly editorService: EditorService) {}
  static async loadContent(note: Note, forced = false) {
    if (!forced && !isNull(note.content.value)) {
      return;
    }

    const noteRepository = container.resolve(NoteRepository);
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
    const noteRepository = container.resolve(NoteRepository);

    return noteRepository.createNote(newNote);
  }

  async createAndOpenInEditor(parent: Notebook, parentSynced: boolean) {
    const note = await NoteService.createEmptyNote(parent, parentSynced);
    await this.editorService.openInEditor(note);
  }
}
