/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Notebook, Note, ROOT_NOTEBOOK_ID } from 'domain/entity';
import type { Dao } from './types';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, inject } from 'tsyringe';

@singleton()
export class NotebookRepository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
  ) {}

  loadChildrenOf(notebook: Notebook): Promise<(Note | Notebook)[]> {
    const notebookId = notebook.id;
    const notebooks = this.notebookDao!.all({ parentId: notebookId });
    const notes = this.noteDao!.all({ parentId: notebookId }, [
      'id',
      'title',
      'sortOrder',
      'userCreatedAt',
      'userModifiedAt',
      'parentId',
    ]);

    return Promise.all([notebooks, notes]).then(([notebooks, notes]) => {
      return [
        ...notes
          .filter((noteDo) => noteDo.id !== notebook.indexNoteId)
          .map((noteDo) => Note.from(noteDo, notebook)),
        ...notebooks.map((notebookDo) => Notebook.from(notebookDo, notebook)),
      ];
    });
  }

  async queryOrCreateRootNotebook() {
    const root = await this.notebookDao!.one({ id: ROOT_NOTEBOOK_ID });
    const rootNotebook = root
      ? Notebook.from(root)
      : Notebook.createRootNotebook();

    if (!root) {
      await this.createNotebook(rootNotebook);
    }

    return rootNotebook;
  }

  async createNotebook(notebook: Notebook) {
    await this.notebookDao!.create(notebook.toDo());
    return notebook;
  }

  async updateNotebook(notebook: Notebook) {
    await this.notebookDao!.update(notebook.toDo());
    return notebook;
  }
}
