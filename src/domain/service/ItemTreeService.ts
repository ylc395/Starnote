import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import {
  Notebook,
  ItemTree,
  TreeItem,
  NotebookDataObject,
  NoteDataObject,
  ItemTreeEvents,
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

    this.itemTree
      .on(ItemTreeEvents.Updated, this.syncItem, this)
      .on(ItemTreeEvents.Created, this.syncNewItem, this)
      .on(ItemTreeEvents.Deleted, this.syncDeletedItem, this);
  }

  private syncItem<T extends keyof (NotebookDataObject | NoteDataObject)>(
    item: TreeItem,
    fields?: T[],
  ) {
    if (Notebook.isA(item)) {
      return this.notebookRepository.updateNotebook(item, fields);
    } else {
      return this.noteRepository.updateNote(item, fields);
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
