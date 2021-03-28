import { container } from 'tsyringe';
import { NoteRepository } from 'domain/repository';
import {
  EditorManager,
  Notebook,
  Note,
  TreeItem,
  EntityEvents,
  ItemTreeEvents,
  ItemTree,
} from 'domain/entity';
import { ItemTreeService } from './ItemTreeService';
import { effect } from '@vue/reactivity';
import { debounce, isNull } from 'lodash';
import { selfish } from 'utils/index';

export const token = Symbol();
export class EditorService {
  readonly editorManager = selfish(new EditorManager());
  private readonly noteRepository = container.resolve(NoteRepository);
  constructor(itemTreeService: ItemTreeService) {
    effect(this.keepSync.bind(this));
    this.monitorItemTree(itemTreeService.itemTree);
  }

  private monitorItemTree(itemTree: ItemTree) {
    itemTree.on(ItemTreeEvents.Selected, this.openInEditor, this);
    itemTree.on(
      ItemTreeEvents.Deleted,
      this.editorManager.closeNote,
      this.editorManager,
    );
  }

  private keepSync() {
    this.editorManager.activeEditor.value?.on(
      EntityEvents.Sync,
      debounce((note: Note) => this.noteRepository.updateNote(note), 500),
    );
  }
  private async loadContentOf(note: Note, forced = false) {
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
      await this.loadContentOf(note);
      this.editorManager.openInEditor(note);
    }
  }
}
