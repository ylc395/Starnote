/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import { merge } from 'rxjs';
import { map, mergeAll, filter } from 'rxjs/operators';
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
    const event$ = this.itemTree.event$;

    const updated$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Updated),
      map(({ fields, item }) => this.syncItem(item!, fields!)),
    );

    const created$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Created),
      map(({ item }) => this.syncNewItem(item!)),
    );

    const deleted$ = event$.pipe(
      filter(({ event }) => event === ItemTreeEvents.Deleted),
      map(({ item }) => this.syncDeletedItem(item!)),
    );

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
