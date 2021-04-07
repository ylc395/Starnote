import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import {
  Notebook,
  ItemTree,
  TreeItem,
  Note,
  SortByEnums,
  SortDirectEnums,
  NotebookDataObject,
  NoteDataObject,
  ItemTreeEvents,
} from 'domain/entity';
import { selfish } from 'utils/index';
import { AppEventBus, AppEvents } from './AppEventBus';

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  private readonly appEventBus = container.resolve(AppEventBus);
  readonly itemTree = selfish(container.resolve(ItemTree));
  constructor() {
    this.initTree();
  }

  private async initTree() {
    const items = await this.notebookRepository.fetchTree();
    this.itemTree.loadTree(items);
    this.itemTree.on(ItemTreeEvents.Updated, this.syncItem, this);
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

  async createNote(parent?: Notebook) {
    const target = parent || this.itemTree.selectedItem.value;

    if (!Notebook.isA(target)) {
      throw new Error('no target notebook');
    }

    const newNote = target.createNote();
    await this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(newNote);
  }

  async createSubNotebook(title: string, parent: Notebook | null) {
    const newNotebook = parent
      ? parent.createSubNotebook(title)
      : this.itemTree.root.createSubNotebook(title);

    if (parent) {
      this.itemTree.expandNotebook(parent);
    }

    await this.notebookRepository.createNotebook(newNotebook);
    this.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  async createIndexNote(parent: Notebook) {
    const newNote = parent.createIndexNote();

    await this.notebookRepository.updateNotebook(parent, ['indexNoteId']);
    await this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(parent);

    return newNote;
  }

  async deleteItem(item: TreeItem) {
    this.itemTree.deleteItem(item);

    switch (true) {
      case Note.isA(item):
        await this.noteRepository.deleteNote(item as Note);
        break;
      case Notebook.isA(item):
        await this.notebookRepository.deleteNotebook(item as Notebook);
        break;
      default:
        break;
    }
    this.appEventBus.emit(AppEvents.ITEM_DELETED);
  }

  async setSortBy(notebook: Notebook, value: SortByEnums) {
    let result;

    if (value === SortByEnums.Custom) {
      result = Promise.all(
        notebook.sortedChildren.value.map(async (item, index) => {
          item.sortOrder.value = index + 1;
          return this.syncItem(item, ['sortOrder']);
        }),
      );
    }

    notebook.sortBy.value = value;
    result = this.notebookRepository.updateNotebook(notebook, ['sortBy']);

    return result;
  }

  setSortDirect(notebook: Notebook, value: SortDirectEnums) {
    notebook.sortDirect.value = value;
    this.notebookRepository.updateNotebook(notebook, ['sortDirect']);
  }

  setSortOrders(items: TreeItem[]) {
    items.forEach((item, index) => {
      item.sortOrder.value = index + 1;
      this.syncItem(item, ['sortOrder']);
    });
  }
}
