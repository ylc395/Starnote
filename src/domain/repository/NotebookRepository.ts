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
      const children = [
        ...notes
          .filter((noteDo) => {
            const isIndexNote = noteDo.id === notebook.indexNoteId;
            const isAlreadyIn = notebook.children.value?.find(
              (note) => note.id === noteDo.id,
            );

            return !isIndexNote && !isAlreadyIn;
          })
          .map((noteDo) => Note.from(noteDo, notebook)),
        ...notebooks
          .filter((notebookDo) => {
            return !notebook.children.value?.find(
              (notebook) => notebook.id === notebookDo.id,
            );
          })
          .map((notebookDo) => Notebook.from(notebookDo, notebook)),
      ];

      notebook.children.value = children;
      notebook.isChildrenLoaded = true;
      return children;
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

  deleteNotebook(notebook: Notebook) {
    return this.notebookDao!.deleteById(notebook.id);
  }
}
