import { Notebook } from 'domain/entity';
import { NotebookRepository } from 'domain/repository';
import { container } from 'tsyringe';
import { ItemTreeService } from './ItemTreeService';

const notebookRepository = container.resolve(NotebookRepository);

export class NotebookService {
  readonly notebook: Notebook | null;
  constructor(
    private readonly notebookTree: ItemTreeService,
    notebook: Notebook | boolean,
  ) {
    this.notebook = Notebook.isA(notebook)
      ? notebook
      : this.notebookTree.itemTree.root.value;
  }

  async createSubNotebook(title: string) {
    const targetNotebook =
      this.notebook || this.notebookTree.itemTree.selectedItem.value;

    if (!targetNotebook || !Notebook.isA(targetNotebook)) {
      throw new Error('no target notebook!');
    }

    await this.notebookTree.expandNotebook(targetNotebook.id);
    const newNotebook = await NotebookService.create(targetNotebook, title);

    this.notebookTree.itemTree.setSelectedItem(newNotebook);
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
}
