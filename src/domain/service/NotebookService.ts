import { Notebook } from 'domain/entity';
import {
  NotebookRepository,
  NoteRepository,
  QueryEntityTypes,
} from 'domain/repository';
import { container } from 'tsyringe';
import { EditorService } from './EditorService';
import { ItemTreeService } from './ItemTreeService';

export const token = Symbol();
export class NotebookService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  constructor(
    private readonly editorService?: EditorService,
    private readonly itemTreeService?: ItemTreeService,
  ) {}
  async createSubNotebook(title: string, parent?: Notebook) {
    const target = parent || this.itemTreeService?.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }

    const newNotebook = target.createSubNotebook(title);

    await this.notebookRepository.createNotebook(newNotebook);
    this.itemTreeService?.itemTree.setSelectedItem(newNotebook);
    this.itemTreeService?.itemTree.expandNotebook(target);

    return newNotebook;
  }

  async createIndexNote(title: string, parent?: Notebook) {
    const target = parent || this.itemTreeService?.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }

    const newNotebook = target.createIndexNote(title);

    await this.notebookRepository.updateNotebook(newNotebook);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.noteRepository.createNote(newNotebook.indexNote.value!);
    this.editorService?.openInEditor(newNotebook);
  }

  static async loadChildren(
    notebook: Notebook,
    notebookOnly = true,
    force = false,
  ) {
    if (notebook.isChildrenLoaded && !force) {
      return;
    }

    const notebookRepository = container.resolve(NotebookRepository);
    const { notebooks, notes } = await notebookRepository.queryChildrenOf(
      notebook,
      notebookOnly ? QueryEntityTypes.Notebook : QueryEntityTypes.All,
    );

    notebook.children.value = [...notebooks, ...notes];
  }
}
