/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Notebook,
  Note,
  ROOT_NOTEBOOK_ID,
  NoteDo,
  NotebookDo,
  ObjectWithId,
} from 'domain/entity';
import type { Dao } from './types';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, inject } from 'tsyringe';
import { pick } from 'lodash';

@singleton()
export class NotebookRepository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<NoteDo>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<NotebookDo>,
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
            return noteDo.id !== notebook.indexNote.value?.id;
          })
          .map((noteDo) => {
            const isAlreadyIn = notebook.children.value?.find(
              (note) => note.id === noteDo.id,
            );

            return isAlreadyIn || Note.from(noteDo, notebook);
          }),
        ...notebooks.map((notebookDo) => {
          const existed = notebook.children.value?.find(
            (notebook) => notebook.id === notebookDo.id,
          );

          return existed || Notebook.from(notebookDo, notebook);
        }),
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

  async updateNotebook(notebook: Notebook, fields?: (keyof NotebookDo)[]) {
    const payload = fields
      ? (pick(notebook.toDo(), [...fields, 'id']) as NotebookDo & ObjectWithId)
      : notebook.toDo();
    await this.notebookDao!.update(payload);
    return notebook;
  }

  deleteNotebook(notebook: Notebook) {
    return this.notebookDao!.deleteById(notebook.id);
  }
}
