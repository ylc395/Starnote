import { Notebook } from 'domain/entity';
import { NotebookRepository, QueryEntityTypes } from 'domain/repository';
import { container } from 'tsyringe';
import { EditorService } from './EditorService';
import { ItemTreeService } from './ItemTreeService';
import { NoteService } from './NoteService';

const notebookRepository = container.resolve(NotebookRepository);

export class NotebookService {
  readonly notebook: Notebook | null;
  constructor(private readonly itemTree: ItemTreeService, notebook?: Notebook) {
    this.notebook = Notebook.isA(notebook)
      ? notebook
      : this.itemTree.itemTree.root.value;
  }

  async createSubNotebook(title: string) {
    if (!Notebook.isA(this.notebook)) {
      throw new Error('no target notebook!');
    }

    await this.itemTree.expandNotebook(this.notebook);
    const newNotebook = await NotebookService.create(this.notebook, title);

    this.itemTree.itemTree.setSelectedItem(newNotebook);

    return newNotebook;
  }

  async createIndexNote(title: string, editorService: EditorService) {
    const newNotebook = await this.createSubNotebook(title);
    const newNote = await NoteService.createEmptyNote(newNotebook, false, {
      title,
    });

    newNotebook.indexNote.value = newNote;
    notebookRepository.updateNotebook(newNotebook);
    editorService.openInEditor(newNote, newNotebook);
  }

  static create(parent: Notebook, title: string) {
    const newNotebook = Notebook.from(
      {
        parentId: parent.id,
        title,
      },
      parent,
    );

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

    const { notebooks, notes } = await notebookRepository.queryChildrenOf(
      notebook,
      notebookOnly ? QueryEntityTypes.Notebook : QueryEntityTypes.All,
    );

    notebook.children.value = [...notebooks, ...notes];
  }
}
