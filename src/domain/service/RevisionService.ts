/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { container, InjectionToken } from 'tsyringe';
import { merge } from 'rxjs';
import { debounceTime, filter, concatMap, tap } from 'rxjs/operators';
import {
  ItemTree,
  ItemTreeEvents,
  Note,
  Notebook,
  EditorManager,
  EditorManagerEvents,
  NOTE_SUFFIX,
} from 'domain/entity';
import type {
  TreeItem,
  NotebookDataObject,
  NoteDataObject,
  GitStatusMark,
} from 'domain/entity';
import { NoteRepository } from 'domain/repository';
import { ref, Ref, shallowRef } from '@vue/reactivity';
import { difference } from 'lodash';

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
  commit(commitMessage: string): Promise<void>;
  getStatus(): Promise<FileGitStatus[]>;
  restore(path: string): Promise<NoteDataObject>;
}

export const token = Symbol();
export class RevisionService {
  private readonly noteRepository = container.resolve(NoteRepository);
  private readonly itemTree = container.resolve(ItemTree);
  private readonly editorManager = container.resolve(EditorManager);
  private readonly git = container.resolve(GIT_TOKEN);
  readonly changedNotes: Ref<(Note | FileGitStatus)[]> = shallowRef([]);
  readonly isRefreshing = ref(false);
  constructor() {
    this.keepGitIndexSynced();
  }

  async restore(path: string) {
    const restoredNoteDO = await this.git.restore(path);
    const note = this.itemTree.indexedNotes.get(restoredNoteDO.id!, true);

    // rename / move / modify / create
    if (note) {
      // create
      if (note.gitStatus.value === 'A') {
        this.itemTree.deleteItem(note);
        return;
      }

      note.content.value = restoredNoteDO.content!;
      note.title.value = restoredNoteDO.title!;

      // rename / modify
      if (note.getPath() === path) {
        await this.noteRepository.updateNote(note, ['content', 'title']);
        await this.refreshGitStatus();
        return;
      }
    }

    // move / delete
    const notebookPath = `/${path.split('/').slice(1, -1).join('/')}`;
    const notebook = this.itemTree.getItemByPath(
      notebookPath,
      true,
    ) as Notebook;

    if (note) {
      this.itemTree.moveTo(note, notebook);
    } else {
      this.itemTree.createNote(notebook, restoredNoteDO);
    }
  }

  async commit() {
    await this.git.commit('REVISION');
    await this.refreshGitStatus();
  }

  private async refreshGitStatus() {
    const statuses = await this.git.getStatus();
    const changedItems = [];

    for (const { status, file } of statuses) {
      if (!file.endsWith(NOTE_SUFFIX)) {
        continue;
      }

      if (['D', 'R'].includes(status)) {
        changedItems.push({ status, file });
        continue;
      }

      const item = this.itemTree.getItemByPath(file);

      if (Note.isA(item)) {
        item.gitStatus.value = status;
        changedItems.push(item);
      } else {
        return;
      }
    }

    difference(this.changedNotes.value, changedItems)
      .filter(Note.isA)
      .forEach((note) => (note.gitStatus.value = 'unknown'));

    this.changedNotes.value = changedItems;
    this.isRefreshing.value = false;
  }

  private keepGitIndexSynced() {
    const itemEvent$ = this.itemTree.event$.pipe(
      filter(({ event }) =>
        [
          ItemTreeEvents.Created,
          ItemTreeEvents.Deleted,
          ItemTreeEvents.Updated,
          ItemTreeEvents.Loaded,
        ].includes(event),
      ),
    );

    const noteSynced$ = this.editorManager.event$.pipe(
      filter(({ event }) => event === EditorManagerEvents.Sync),
    );

    merge(itemEvent$, noteSynced$)
      .pipe(
        tap(() => (this.isRefreshing.value = true)),
        concatMap((e) => {
          const { event, snapshot } = e;
          const item = 'item' in e ? e.item : 'note' in e ? e.note : null;

          if (!item && event !== ItemTreeEvents.Loaded) {
            throw new Error('no item to update');
          }

          switch (event) {
            case ItemTreeEvents.Loaded:
              return this.git.init(this.itemTree);
            case ItemTreeEvents.Created:
              return this.createFileByItem(item!);
            case ItemTreeEvents.Deleted:
              return this.git.deleteFileByItem(item!);
            default:
              return this.updateFileByItem(item!, snapshot!);
          }
        }),
        debounceTime(1000),
      )
      .subscribe(() => this.refreshGitStatus());
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
    if (Notebook.isA(item) && item.isEmpty(true)) {
      return;
    }

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
      throw new Error('invalid snapshot when updateFile');
    }

    const oldParent = this.itemTree.indexedNotebooks.get(parentId);

    return this.git.moveItem(item, {
      parent: oldParent,
      title,
    });
  }
}
