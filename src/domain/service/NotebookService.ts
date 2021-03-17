import { Notebook } from 'domain/entity';
import { NotebookRepository } from 'domain/repository';
import { container } from 'tsyringe';

const notebookRepository = container.resolve(NotebookRepository);

export class NotebookService {
  async create(parent: Notebook, title: string) {
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
