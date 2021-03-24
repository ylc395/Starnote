import { container } from 'tsyringe';
import {
  Children,
  NotebookRepository,
  NotebookEvents,
  NoteRepository,
} from 'domain/repository';
import { Note, Notebook, ItemTree, TreeItem } from 'domain/entity';
import { selfish } from 'utils/index';
import { NotebookService } from './NotebookService';

const NOTEBOOK_ONLY = true;

export const token = Symbol();
export class ItemTreeService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  readonly itemTree = selfish(new ItemTree());
  constructor() {
    this.init();
  }
  private async init() {
    this.itemTree.on('sync', this.syncItem);

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

    NotebookService.loadChildren(rootNotebook, NOTEBOOK_ONLY);
    this.itemTree.loadRoot(rootNotebook);
  }

  private syncItem(item: Note | Notebook) {
    if (item instanceof Note) {
      this.noteRepository.updateNote(item);
    }

    if (item instanceof Notebook) {
      this.notebookRepository.updateNotebook(item);
    }
  }
}
