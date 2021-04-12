import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import { fromEvent, merge } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import type EventEmitter from 'eventemitter3';
import { Notebook, ItemTree, ItemTreeEvents } from 'domain/entity';
import type {
  TreeItem,
  NotebookDataObject,
  NoteDataObject,
} from 'domain/entity';
import { selfish } from 'utils/index';

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  readonly itemTree = selfish(container.resolve(ItemTree));
  constructor() {
    this.initTree();
  }

  private async initTree() {
    const items = await this.notebookRepository.fetchTree();
    this.itemTree.loadTree(items);

    const updated$ = fromEvent<
      [
        TreeItem,
        NoteDataObject | NotebookDataObject,
        (keyof NoteDataObject)[] | (keyof NotebookDataObject)[],
      ]
    >(this.itemTree as EventEmitter, ItemTreeEvents.Updated).pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(([item, _, fields]) => this.syncItem(item, fields)),
    );

    const created$ = fromEvent<TreeItem>(
      this.itemTree as EventEmitter,
      ItemTreeEvents.Updated,
    ).pipe(map((item) => this.syncNewItem(item)));

    const deleted$ = fromEvent<TreeItem>(
      this.itemTree as EventEmitter,
      ItemTreeEvents.Deleted,
    ).pipe(map((item) => this.syncDeletedItem(item)));

    merge(deleted$, created$, updated$).pipe(mergeAll()).subscribe();
  }

  private syncItem<T extends NotebookDataObject | NoteDataObject>(
    item: TreeItem,
    fieldsToUpdate: (keyof T)[],
  ) {
    if (Notebook.isA(item)) {
      return this.notebookRepository.updateNotebook(
        item,
        fieldsToUpdate as (keyof NotebookDataObject)[],
      );
    } else {
      return this.noteRepository.updateNote(
        item,
        fieldsToUpdate as (keyof NoteDataObject)[],
      );
    }
  }

  private syncNewItem(item: TreeItem) {
    if (Notebook.isA(item)) {
      return this.notebookRepository.createNotebook(item);
    } else {
      return this.noteRepository.createNote(item);
    }
  }

  private syncDeletedItem(item: TreeItem) {
    if (Notebook.isA(item)) {
      return this.notebookRepository.deleteNotebook(item);
    } else {
      return this.noteRepository.deleteNote(item);
    }
  }
}
