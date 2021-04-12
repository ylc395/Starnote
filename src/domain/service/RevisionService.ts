import { container, InjectionToken } from 'tsyringe';
import { fromEvent } from 'rxjs';
import { buffer, debounceTime } from 'rxjs/operators';
import {
  ItemTree,
  ItemTreeEvents,
  TreeItem,
  Note,
  EditorManager,
  EditorManagerEvents,
  NoteDataObject,
  NotebookDataObject,
  Notebook,
} from 'domain/entity';
import EventEmitter from 'eventemitter3';
export const GIT_TOKEN: InjectionToken<Git> = Symbol();

export interface Git {
  noteToFile(note: Note): Promise<void>;
  deleteFileByItem(item: TreeItem): Promise<void>;
  moveItem(
    item: TreeItem,
    snapshot: { parent?: Notebook; title?: string },
  ): Promise<void>;
  init(tree: ItemTree): Promise<void>;
  clone(url: string): Promise<void>;
}

export class RevisionService {
  private readonly itemTree = container.resolve(ItemTree);
  private readonly editorManager = container.resolve(EditorManager);
  private git = container.resolve(GIT_TOKEN);
  constructor() {
    this.itemTree
      .on(ItemTreeEvents.Deleted, this.git.deleteFileByItem, this.git)
      .on(ItemTreeEvents.Updated, this.updateFileByItem, this);

    const noteSynced$ = fromEvent<[Note, NoteDataObject]>(
      this.editorManager as EventEmitter,
      EditorManagerEvents.Sync,
    );

    noteSynced$
      .pipe(buffer(noteSynced$.pipe(debounceTime(500))))
      .subscribe((events) => {
        this.updateFileByItem(events[0][0], events[0][1]);
      });

    this.git.init(this.itemTree);
  }

  async updateFileByItem<T extends NotebookDataObject | NoteDataObject>(
    item: TreeItem,
    snapshot: T,
  ) {
    const hasContentUpdated =
      Note.isA(item) &&
      item.content.value !== (snapshot as NoteDataObject).content;

    if (hasContentUpdated) {
      await this.git.noteToFile(item as Note);
    }

    const hasUpdatedInPlace =
      snapshot.parentId === item.parentId &&
      snapshot.title === item.title.value;

    if (hasUpdatedInPlace) {
      return;
    }

    const oldParentId = snapshot.parentId || item.parentId;
    const oldParent = oldParentId
      ? this.itemTree.indexedNotebooks.get(oldParentId)
      : undefined;

    return this.git.moveItem(item, {
      parent: oldParent,
      title: snapshot.title,
    });
  }
}
