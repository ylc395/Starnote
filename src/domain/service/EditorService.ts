import { computed, effect } from '@vue/reactivity';
import { container } from 'tsyringe';
import { EditorManager, Note, Notebook } from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { selfish } from 'utils/index';
import { debounce } from 'lodash';
import { NoteService } from './NoteService';
import { ItemTreeService } from './ItemTreeService';

const noteRepository = container.resolve(NoteRepository);
export const token = Symbol();

export class EditorService {
  editorManager = selfish(new EditorManager());
  constructor(private readonly itemTreeService: ItemTreeService) {
    this.keepActiveNoteSynced();
  }

  private keepActiveNoteSynced() {
    effect(() => {
      const activeEditor = this.editorManager.activeEditor.value;

      if (!activeEditor || !activeEditor.note.value) {
        return;
      }

      activeEditor.on(
        'saved',
        debounce(noteRepository.updateNote.bind(noteRepository), 500),
      );
    });
  }

  isActive(noteId: Note['id']) {
    return computed(() => {
      return this.editorManager.activeEditor.value?.note.value?.id === noteId;
    });
  }

  async createAndOpenInEditor(parent: Notebook, parentSynced: boolean) {
    const note = await NoteService.createEmptyNote(parent, parentSynced);
    await this.openInEditor(note, true, parent);
  }

  async openInEditor(
    item: Note | Notebook,
    isNew = false,
    parent: Notebook | null = null,
  ) {
    const note = Notebook.isA(item) ? item.indexNote.value : item;

    if (!note) {
      return;
    }

    if (!isNew) {
      await NoteService.loadContent(note);
    }

    this.editorManager.openInEditor(note);

    if (parent) {
      this.itemTreeService.itemTree.setSelectedItem(parent);
    }
  }
}
