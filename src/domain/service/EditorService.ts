import { container } from 'tsyringe';
import { NoteRepository } from 'domain/repository';
import {
  EditorManager,
  Notebook,
  Note,
  TreeItem,
  EntityEvents,
  ItemTreeEvents,
} from 'domain/entity';
import { ItemTreeService } from './ItemTreeService';
import { effect } from '@vue/reactivity';
import { debounce } from 'lodash';
import { selfish } from 'utils/index';

export const token = Symbol();
export class EditorService {
  readonly editorManager = selfish(new EditorManager());
  private readonly noteRepository = container.resolve(NoteRepository);
  constructor(private readonly itemTreeService: ItemTreeService) {
    this.itemTreeService.itemTree.on(
      ItemTreeEvents.Selected,
      this.openInEditor,
      this,
    );

    effect(this.keepSync.bind(this));
  }

  private keepSync() {
    this.editorManager.activeEditor.value?.on(
      EntityEvents.Sync,
      debounce((note: Note) => this.noteRepository.updateNote(note), 500),
    );
  }

  async openInEditor(item: TreeItem) {
    const note = (() => {
      if (!Notebook.isA(item)) {
        return item;
      }

      if (item.noteJustCreated) {
        const note = item.noteJustCreated;
        item.noteJustCreated = null;
        return note;
      }

      if (item.indexNote.value) {
        return item.indexNote.value;
      }
    })();

    if (note) {
      await ItemTreeService.loadContentOf(note);
      this.editorManager.openInEditor(note);
    }
  }
}
