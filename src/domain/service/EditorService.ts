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
import { isNull } from 'lodash';
import { concatMap, filter } from 'rxjs/operators';
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
    itemTree.event$.subscribe(({ event, item }) => {
      if (event === ItemTreeEvents.Selected && item) {
        this.openInEditor(item);
      }

      if (event === ItemTreeEvents.Deleted && item) {
        this.editorManager.closeEditorOf(item);
      }
    });
  }

  private keepSync() {
    this.editorManager.event$
      .pipe(
        filter(({ event }) => event === EditorManagerEvents.Sync),
        concatMap(({ note }) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.noteRepository.updateNote(note!, [
            'title',
            'content',
            'userModifiedAt',
          ]);
        }),
      )
      .subscribe();
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
