import { NoteRepository } from 'domain/repository';
import { effect } from '@vue/reactivity';
import { container } from 'tsyringe';
import { EditorManager, Note } from 'domain/entity';
import { selfish } from 'utils/index';

const noteRepository = container.resolve(NoteRepository);
export const token = Symbol();

export class EditorService {
  editorManager = selfish(new EditorManager());
  constructor() {
    this.keepActiveNoteSynced();
  }

  private keepActiveNoteSynced() {
    effect(() => {
      const activeEditor = this.editorManager.activeEditor.value;

      if (!activeEditor || !activeEditor.note.value) {
        return;
      }

      activeEditor.on('sync', (note: Note) => {
        noteRepository.updateNote(note);
      });
    });
  }

  async openNewEditor(note: Note) {
    await noteRepository.loadContent(note);
    this.editorManager.openNewEditor(note);
  }
}
