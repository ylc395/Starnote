import { container } from 'tsyringe';
import {
  Children,
  NotebookRepository,
  NoteRepository,
} from 'domain/repository';
import { Note, Notebook, ItemTree, TreeItem } from 'domain/entity';
import { selfish } from 'utils/index';

const notebookRepository = container.resolve(NotebookRepository);
const noteRepository = container.resolve(NoteRepository);
const NOTEBOOK_ONLY = true;

export const token = Symbol();
export class ItemTreeService {
  readonly itemTree = selfish(new ItemTree());
  constructor() {
    this.init();
  }
  private async init() {
    this.itemTree.on('sync', this.syncItem);

    notebookRepository.on('itemFetched', (items: TreeItem | Children) => {
      this.itemTree.putItem(
        'id' in items ? items : [...items.notebooks, ...items.notes],
      );
    });

    notebookRepository.on(
      'notebookCreated',
      this.itemTree.putItem,
      this.itemTree,
    );

    const rootNotebook = await notebookRepository.queryOrCreateRootNotebook(
      NOTEBOOK_ONLY,
    );
    this.itemTree.loadRoot(rootNotebook);
  }

  private syncItem(item: Note | Notebook) {
    if (item instanceof Note) {
      noteRepository.updateNote(item);
    }

    if (item instanceof Notebook) {
      notebookRepository.updateNotebook(item);
    }
  }

  async expandNotebook(notebook: Notebook) {
    if (notebook.isRoot) {
      return;
    }

    await notebookRepository.loadChildren(notebook, NOTEBOOK_ONLY);

    if (!this.itemTree.isExpanded(notebook)) {
      this.itemTree.expandedIds.value = [
        ...this.itemTree.expandedIds.value,
        notebook.id,
      ];
    }
  }
}
