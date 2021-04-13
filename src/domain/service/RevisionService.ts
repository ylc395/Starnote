/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { container, InjectionToken } from 'tsyringe';
import { merge } from 'rxjs';
import { buffer, debounceTime, map, mergeAll, filter } from 'rxjs/operators';
import {
  ItemTree,
  ItemTreeEvents,
  Note,
  EditorManager,
  EditorManagerEvents,
} from 'domain/entity';
import type {
  TreeItem,
  NotebookDataObject,
  NoteDataObject,
  Notebook,
} from 'domain/entity';
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
    this.git.init(this.itemTree);
    this.keepWorkingTreeSynced();
  }

  private keepWorkingTreeSynced() {
    const event$ = this.itemTree.event$;
    const deleted$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Deleted),
      map(({ item }) => this.git.deleteFileByItem(item!)),
    );
    const created$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Created),
      map(({ item }) => this.createFileByItem(item!)),
    );

    const updated$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Updated),
      map(({ item, snapshot }) => this.updateFileByItem(item!, snapshot!)),
    );

    const noteSynced$ = this.editorManager.event$.pipe(
      filter(({ event }) => event === EditorManagerEvents.Sync),
    );

    const debouncedNoteSynced$ = noteSynced$.pipe(
      // todo: 我们暂且假设一个 buffer 里都是同一个 item 的 synced 事件
      buffer(noteSynced$.pipe(debounceTime(500))),
      map(([{ note, snapshot }]) => this.updateFileByItem(note!, snapshot!)),
    );

    merge(deleted$, updated$, created$, debouncedNoteSynced$)
      .pipe(mergeAll())
      .subscribe();
  }

  private async createFileByItem(item: TreeItem) {
    if (!Note.isA(item)) {
      return;
    }

    return this.git.noteToFile(item);
  }

  private async updateFileByItem<T extends NotebookDataObject | NoteDataObject>(
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
