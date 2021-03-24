import { Notebook } from 'domain/entity';
import { NotebookRepository, QueryEntityTypes } from 'domain/repository';
import { container } from 'tsyringe';
import { EditorService } from './EditorService';
import { ItemTreeService } from './ItemTreeService';
import { NoteService } from './NoteService';

export const token = Symbol();
export class NotebookService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  constructor(
    private readonly editorService: EditorService,
    private readonly itemTreeService: ItemTreeService,
  ) {}
  async createSubNotebook(title: string, parent?: unknown) {
    const target = Notebook.isA(parent)
      ? parent
      : this.itemTreeService.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }

    await this.itemTreeService.itemTree.expandNotebook(target);
    const newNotebook = await NotebookService.create(target, title);
    this.itemTreeService.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  async createIndexNote(title: string, parent?: unknown) {
    const target = Notebook.isA(parent)
      ? parent
      : this.itemTreeService.itemTree.root.value;

    if (!Notebook.isA(target)) {
      throw new Error('sub notebook parent is not a notebook');
    }

    const newNotebook = await this.createSubNotebook(title, target);
    const newNote = await NoteService.createEmptyNote(newNotebook, false, {
      title,
    });

    newNotebook.indexNote.value = newNote;
    this.notebookRepository.updateNotebook(newNotebook);
    this.editorService.openInEditor(newNotebook);
  }

  static create(parent: Notebook, title: string) {
    const newNotebook = Notebook.from(
      {
        parentId: parent.id,
        title,
      },
      parent,
    );

    const notebookRepository = container.resolve(NotebookRepository);
    return notebookRepository.createNotebook(newNotebook);
  }

  static async loadChildren(
    notebook: Notebook,
    notebookOnly: boolean,
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
