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
    this.itemTree.on('itemUpdated', this.syncItem);

    notebookRepository.on('itemFetched', (items: TreeItem | Children) => {
      this.itemTree.putTreeItemsInCache(
        'id' in items ? items : [...items.notebooks, ...items.notes],
      );
    });

    notebookRepository.on(
      'notebookCreated',
      this.itemTree.putTreeItemsInCache,
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

  async expandNotebook(
    notebookId: Notebook['id'] | Notebook,
    expandParent = true,
  ) {
    const notebook =
      notebookId instanceof Notebook
        ? notebookId
        : this.itemTree.itemsKV.getItem(notebookId, Notebook);

    if (notebook.isRoot) {
      return;
    }

    await notebookRepository.loadChildren(notebook, NOTEBOOK_ONLY);

    if (notebook.hasParent() && expandParent) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.expandNotebook(notebook.parentId.value!, true);
    }

    if (!this.itemTree.expandedIds.value.includes(notebook.id)) {
      this.itemTree.expandedIds.value = [
        ...this.itemTree.expandedIds.value,
        notebook.id,
      ];
    }
  }
}
