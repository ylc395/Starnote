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

  createNote(parent?: Notebook) {
    const target = parent || this.itemTree.selectedItem.value;

    if (!Notebook.isA(target)) {
      throw new Error('no target notebook');
    }

    const newNote = target.createNote();
    this.itemTree.indexedNotes.set(newNote.id, newNote);
    this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(newNote);
  }

  createSubNotebook(title: string, parent: Notebook) {
    const newNotebook = parent.createSubNotebook(title);

    if (parent) {
      this.itemTree.expandNotebook(parent);
    }

    this.notebookRepository.createNotebook(newNotebook);
    this.itemTree.setSelectedItem(newNotebook);
  }

  createIndexNote(parent: Notebook) {
    const newNote = parent.createIndexNote();

    this.notebookRepository.updateNotebook(parent, ['indexNoteId']);
    this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(parent);

    return newNote;
  }

  deleteItem(item: TreeItem) {
    this.itemTree.deleteItem(item);

    switch (true) {
      case Note.isA(item):
        this.noteRepository.deleteNote(item as Note);
        break;
      case Notebook.isA(item):
        this.notebookRepository.deleteNotebook(item as Notebook);
        break;
      default:
        break;
    }
  }

  setSortBy(notebook: Notebook, value: SortByEnums) {
    if (value === SortByEnums.Custom) {
      notebook.sortedChildren.value.forEach((item, index) => {
        item.sortOrder.value = index + 1;
        this.syncItem(item, ['sortOrder']);
      });
    }

    notebook.sortBy.value = value;
    this.notebookRepository.updateNotebook(notebook, ['sortBy']);
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
