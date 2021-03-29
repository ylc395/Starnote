import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import {
  Notebook,
  ItemTree,
  TreeItem,
  ItemTreeEvents,
  EntityEvents,
  Note,
} from 'domain/entity';
import { selfish } from 'utils/index';
import { SortByEnums, SortDirectEnums } from 'domain/constant';

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
      .on(EntityEvents.Sync, this.syncItem, this)
      .on(ItemTreeEvents.Expanded, this.loadChildrenOf, this)
      .on(ItemTreeEvents.Selected, this.loadChildrenOf, this);

    this.initRoot();
  }

  private async initRoot() {
    const rootNotebook = await this.notebookRepository.queryOrCreateRootNotebook();
    this.itemTree.loadRoot(rootNotebook);
  }

  private syncItem(item: TreeItem) {
    if (Notebook.isA(item)) {
      this.notebookRepository.updateNotebook(item);
    } else {
      this.noteRepository.updateNote(item);
    }
  }

  private async prepareTarget(parent: unknown) {
    const target = parent || this.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }

    await this.itemTree.expandNotebook(target);
    return target;
  }

  private loadChildrenOf(item: TreeItem) {
    if (!Notebook.isA(item) || item.isChildrenLoaded) {
      return;
    }

    this.notebookRepository.loadChildrenOf(item);
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
    notebook.sortBy.value = value;
    this.notebookRepository.updateNotebook(notebook);

    if (value !== SortByEnums.Custom) {
      return;
    }

    return Promise.all(
      notebook.sortedChildren.value.map(async (item, index) => {
        item.sortOrder.value = index;

        if (Notebook.isA(item)) {
          return this.notebookRepository.updateNotebook(item);
        }

        if (Note.isA(item)) {
          return this.noteRepository.updateNote(item);
        }
      }),
    );
  }

  setSortDirect(notebook: Notebook, value: SortDirectEnums) {
    notebook.sortDirect.value = value;
    this.notebookRepository.updateNotebook(notebook);
  }
}
