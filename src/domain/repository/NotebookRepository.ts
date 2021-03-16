import { Notebook, Note, ROOT_NOTEBOOK_ID } from 'domain/entity';
import { emit, Repository } from './BaseRepository';
import type { Dao } from './BaseRepository';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, inject } from 'tsyringe';

@singleton()
export class NotebookRepository extends Repository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
  ) {
    super();
  }

  @emit('itemFetched')
  queryChildrenOf(notebook: Notebook): Promise<(Notebook | Note)[]> {
    return Promise.all([
      this.notebookDao!.all({ parentId: notebook.id }),
      this.noteDao!.all({ parentId: notebook.id }, [
        'id',
        'title',
        'sortOrder',
        'userCreatedAt',
        'userModifiedAt',
        'parentId',
      ]),
    ]).then(([notebooks, notes]) => {
      const childrenNotebooks = notebooks.map((notebookDo) => {
        return Notebook.from(notebookDo, notebook);
      });
      const childrenNotes = notes.map((note) => {
        return Note.from(note, notebook);
      });

      return [...childrenNotebooks, ...childrenNotes];
    });
  }

  async loadChildren(notebook: Notebook, force = false) {
    if (notebook.children.value && !force) {
      return;
    }

    notebook.children.value = await this.queryChildrenOf(notebook);
  }

  @emit('itemFetched')
  async queryOrCreateRootNotebook() {
    const root = await this.notebookDao!.one({ id: ROOT_NOTEBOOK_ID });
    const rootNotebook = root
      ? Notebook.from(root)
      : Notebook.createRootNotebook();

    if (!root) {
      await this.createNotebook(rootNotebook);
    }

    rootNotebook.children.value = await this.queryChildrenOf(rootNotebook);

    return rootNotebook;
  }

  @emit('notebookCreated')
  createNotebook(notebook: Notebook) {
    return this.notebookDao!.create(notebook.toDo());
  }

  @emit('notebookUpdated')
  updateNotebook(notebook: Notebook) {
    return this.notebookDao!.update(notebook.toDo());
  }
}
