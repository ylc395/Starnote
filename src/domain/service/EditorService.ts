import { container } from 'tsyringe';
import { NoteRepository } from 'domain/repository';
import {
  EditorManager,
  Note,
  TreeItem,
  ItemTreeEvents,
  ItemTree,
  EditorManagerEvents,
} from 'domain/entity';
import { debounce, isNull } from 'lodash';
import { selfish } from 'utils/index';

export const token = Symbol();
export class EditorService {
  readonly editorManager = selfish(container.resolve(EditorManager));
  private readonly noteRepository = container.resolve(NoteRepository);
  private readonly itemTree = selfish(container.resolve(ItemTree));
  constructor() {
    this.keepSync();
    this.monitorItemTree(this.itemTree);
  }

  private monitorItemTree(itemTree: ItemTree) {
    itemTree
      .on(ItemTreeEvents.Selected, this.openInEditor, this)
      .on(
        ItemTreeEvents.Deleted,
        this.editorManager.closeEditorOf,
        this.editorManager,
      );
  }

  private keepSync() {
    this.editorManager.on(
      EditorManagerEvents.Sync,
      debounce(
        (note: Note) =>
          this.noteRepository.updateNote(note, [
            'title',
            'content',
            'userModifiedAt',
          ]),
        500,
      ),
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
      if (Note.isA(item)) {
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
