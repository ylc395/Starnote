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
  GitStatusMark,
} from 'domain/entity';
export const GIT_TOKEN: InjectionToken<Git> = Symbol();

interface FileGitStatus {
  status: GitStatusMark;
  file: string;
}

export interface Git {
  noteToFile(note: Note): Promise<void>;
  deleteFileByItem(item: TreeItem): Promise<void>;
  moveItem(
    item: TreeItem,
    snapshot: { parent: Notebook; title: string },
  ): Promise<void>;
  init(tree: ItemTree): Promise<void>;
  clone(url: string): Promise<void>;
  getStatus(): Promise<FileGitStatus[]>;
}

export class RevisionService {
  private readonly itemTree = container.resolve(ItemTree);
  private readonly editorManager = container.resolve(EditorManager);
  private readonly git = container.resolve(GIT_TOKEN);
  constructor() {
    this.keepWorkingTreeSynced();
  }

  private async init() {
    await this.git.init(this.itemTree);
    this.refreshGitStatus();
  }

  private async refreshGitStatus() {
    const statuses = await this.git.getStatus();
    statuses.forEach(({ file, status }) => {
      this.itemTree.getItemByPath(file).gitStatus.value = status;
    });
  }

  private keepWorkingTreeSynced() {
    const event$ = this.itemTree.event$;
    event$.subscribe(async ({ event }) => {
      if (event === ItemTreeEvents.Loaded) {
        this.init();
      }
    });

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
      .pipe(mergeAll(), debounceTime(1000))
      .subscribe(this.refreshGitStatus.bind(this));
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

    const { parentId, title } = snapshot;

    if (!parentId || !title) {
      throw new Error('invalid snapshot when updateFie');
    }

    const oldParent = this.itemTree.indexedNotebooks.get(parentId);

    return this.git.moveItem(item, {
      parent: oldParent,
      title,
    });
  }
}
