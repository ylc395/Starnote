import { container } from 'tsyringe';
import {
  Children,
  NotebookRepository,
  NotebookEvents,
  NoteRepository,
  QueryEntityTypes,
} from 'domain/repository';
import {
  Notebook,
  Note,
  ItemTree,
  TreeItem,
  ItemTreeEvents,
  EntityEvents,
} from 'domain/entity';
import { selfish } from 'utils/index';
import { INDEX_NOTE_TITLE } from 'domain/constant';

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  readonly itemTree = selfish(new ItemTree());
  constructor() {
    this.init();
  }
  private async init() {
    this.itemTree.on(EntityEvents.Sync, this.syncItem, this);
    this.itemTree.on(ItemTreeEvents.Expanded, ItemTreeService.loadChildrenOf);

    this.notebookRepository.on(
      NotebookEvents.NotebookFetched,
      (items: TreeItem | TreeItem[] | Children) => {
        this.itemTree.putItem(
          Array.isArray(items)
            ? items
            : 'id' in items
            ? items
            : [...items.notebooks, ...items.notes],
        );
      },
    );

    this.notebookRepository.on(
      NotebookEvents.NotebookCreated,
      this.itemTree.putItem,
      this.itemTree,
    );

    this.initRoot();
  }

  private async initRoot() {
    const rootNotebook = await this.notebookRepository.queryOrCreateRootNotebook();

    ItemTreeService.loadChildrenOf(rootNotebook);
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

  async createNoteAndOpenInEditor(parent: Notebook) {
    const BIDIRECTIONAL = false; //  todo: 这个变量的值应当由分栏模式决定
    const newNote = Note.createEmptyNote(parent, BIDIRECTIONAL);

    await this.noteRepository.createNote(newNote);
    this.itemTree.setSelectedItem(parent);
  }

  async createSubNotebook(title: string, parent: Notebook | null) {
    const target = await this.prepareTarget(parent);

    const newNotebook = target.createSubNotebook(title);

    await this.notebookRepository.createNotebook(newNotebook);
    this.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  async createSubNotebookWithIndexNote(title: string, parent: Notebook | null) {
    const target = await this.prepareTarget(parent);

    const newNotebook = await target.createSubNotebook(title);
    const indexNote = Note.createEmptyNote(newNotebook, true, {
      title: INDEX_NOTE_TITLE,
    });

    newNotebook.indexNote.value = indexNote;
    await this.notebookRepository.createNotebook(newNotebook);
    await this.noteRepository.createNote(indexNote);
    this.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  private static loadChildrenOf(notebook: Notebook, notebookOnly = true) {
    if (notebook.isChildrenLoaded) {
      return;
    }

    const notebookRepository = container.resolve(NotebookRepository);
    return notebookRepository.queryChildrenOf(
      notebook,
      notebookOnly ? QueryEntityTypes.Notebook : QueryEntityTypes.All,
    );
  }
}
