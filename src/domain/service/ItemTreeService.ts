/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import { filter, concatMap, tap } from 'rxjs/operators';
import { Notebook, ItemTree, ItemTreeEvents } from 'domain/entity';
import type {
  TreeItem,
  NotebookDataObject,
  NoteDataObject,
} from 'domain/entity';
import { selfish } from 'utils/helper';
import { LoggerService } from './LoggerService';

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  readonly itemTree = selfish(container.resolve(ItemTree));
  private readonly logger = container.resolve(LoggerService);
  constructor() {
    this.initTree();
  }

  private async initTree() {
    const items = await this.notebookRepository.fetchTree();
    const event$ = this.itemTree.event$;
    event$
      .pipe(
        tap(({ event }) => this.logger.debug('itemTree', event)),
        filter(({ event }) =>
          [
            ItemTreeEvents.Created,
            ItemTreeEvents.Deleted,
            ItemTreeEvents.Updated,
          ].includes(event),
        ),
        concatMap(({ event, item, fields }) => {
          switch (event) {
            case ItemTreeEvents.Created:
              return this.syncNewItem(item!);
            case ItemTreeEvents.Deleted:
              return this.syncDeletedItem(item!);
            default:
              return this.syncItem(item!, fields!);
          }
        }),
      )
      .subscribe();
    this.itemTree.loadTree(items);
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
