import { Note, Notebook, NoteDo } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';
import { isNull } from 'lodash';
import { EditorService } from './EditorService';

export const token = Symbol();

export class NoteService {
  private readonly noteRepository = container.resolve(NoteRepository);
  constructor(private readonly editorService: EditorService) {}
  async loadContent(note: Note, forced = false) {
    if (!forced && !isNull(note.content.value)) {
      return;
    }

    const noteDo = await this.noteRepository.queryNoteById(note.id, [
      'content',
    ]);

    if (!noteDo) {
      throw new Error(`no note(${note.id}) to load content`);
    }

    note.content.value = noteDo.content ?? '';
  }

  createEmptyNote(parent: Notebook, parentSynced: boolean, note: NoteDo = {}) {
    const newNote = Note.createEmptyNote(parent, parentSynced, note);

    this.noteRepository.createNote(newNote);
    return newNote;
  }

  async createAndOpenInEditor(parent: Notebook, parentSynced: boolean) {
    const note = this.createEmptyNote(parent, parentSynced);
    await this.editorService.openInEditor(note);
  }
}
