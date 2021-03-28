import { container } from 'tsyringe';
import { NotebookRepository, NoteRepository } from 'domain/repository';
import {
  Notebook,
  ItemTree,
  TreeItem,
  ItemTreeEvents,
  EntityEvents,
  ViewMode,
  Note,
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
      .on(EntityEvents.Sync, this.syncItem, this)
      .on(ItemTreeEvents.Expanded, this.loadChildrenOf, this)
      .on(ItemTreeEvents.Selected, this.loadOnSelected, this);

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

  private loadChildrenOf(notebook: Notebook) {
    if (notebook.children.value) {
      return;
    }

    this.notebookRepository.loadChildrenOf(notebook);
  }

  private loadOnSelected(item: TreeItem) {
    if (!Notebook.isA(item)) {
      return;
    }

    if (this.itemTree.mode.value === ViewMode.TwoColumn) {
      this.loadChildrenOf(item);
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
    const parent = item.getParent();

    if (!parent) {
      throw new Error('no parent when delete');
    }

    parent.removeChild(item);

    if (this.itemTree.selectedItem.value === item) {
      this.itemTree.setSelectedItem(parent);
    }

    switch (true) {
      case Note.isA(item):
        return this.noteRepository.deleteNote(item as Note);
      case Notebook.isA(item):
        return this.notebookRepository.deleteNotebook(item as Notebook);
      default:
        return;
    }
  }
}
