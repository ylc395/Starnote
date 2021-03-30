import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import {
  Notebook,
  ItemTree,
  TreeItem,
  ItemTreeEvents,
  Note,
  NotebookDo,
  NoteDo,
  SortByEnums,
  SortDirectEnums,
} from 'domain/entity';
import { selfish } from 'utils/index';

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  readonly itemTree = selfish(new ItemTree());
  constructor() {
    this.init();
  }
  private async init() {
    this.itemTree
      .on(ItemTreeEvents.Expanded, this.loadChildrenOf, this)
      .on(ItemTreeEvents.Selected, this.loadChildrenOf, this);

    this.initRoot();
  }

  private async initRoot() {
    const rootNotebook = await this.notebookRepository.queryOrCreateRootNotebook();
    this.itemTree.loadRoot(rootNotebook);
  }

  private syncItem(item: TreeItem, fields?: string[]) {
    if (Notebook.isA(item)) {
      return this.notebookRepository.updateNotebook(
        item,
        fields as (keyof NotebookDo)[],
      );
    } else {
      return this.noteRepository.updateNote(item, fields as (keyof NoteDo)[]);
    }
  }

  private async prepareTarget(parent: unknown) {
    const target = parent || this.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }
    await this.loadChildrenOf(target);
    await this.itemTree.expandNotebook(target);
    return target;
  }

  private loadChildrenOf(item: TreeItem) {
    if (!Notebook.isA(item) || item.isChildrenLoaded) {
      return;
    }

    return this.notebookRepository.loadChildrenOf(item);
  }

  moveTo(child: TreeItem, parent: Notebook) {
    this.itemTree.moveTo(child, parent);
    this.syncItem(child, ['parentId']);
  }

  rename(item: TreeItem, title: string) {
    this.itemTree.rename(item, title);
    this.syncItem(item, ['title']);
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
    const target = await this.prepareTarget(parent);
    const newNotebook = target.createSubNotebook(title);

    await this.notebookRepository.createNotebook(newNotebook);
    this.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  async createIndexNote(parent: Notebook) {
    const newNote = parent.createIndexNote();

    await this.notebookRepository.updateNotebook(parent);
    await this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(parent);

    return newNote;
  }

  deleteItem(item: TreeItem) {
    this.itemTree.deleteItem(item);

    switch (true) {
      case Note.isA(item):
        return this.noteRepository.deleteNote(item as Note);
      case Notebook.isA(item):
        return this.notebookRepository.deleteNotebook(item as Notebook);
      default:
        return;
    }
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
