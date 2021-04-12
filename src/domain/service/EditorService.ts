import { container } from 'tsyringe';
import { NoteRepository } from 'domain/repository';
import {
  EditorManager,
  Note,
  TreeItem,
  ItemTreeEvents,
  ItemTree,
  EditorManagerEvents,
  NoteDataObject,
} from 'domain/entity';
import { isNull } from 'lodash';
import { fromEvent } from 'rxjs';
import { debounceTime, concatMap } from 'rxjs/operators';
import { selfish } from 'utils/index';
import EventEmitter from 'eventemitter3';

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
    fromEvent<[Note, NoteDataObject]>(
      this.editorManager as EventEmitter,
      EditorManagerEvents.Sync,
    )
      .pipe(
        debounceTime(500),
        concatMap(([note]) => {
          return this.noteRepository.updateNote(note, [
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
