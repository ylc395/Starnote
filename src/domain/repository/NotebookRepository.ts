/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Notebook, Note, ROOT_NOTEBOOK_ID } from 'domain/entity';
import { emit, Repository } from './BaseRepository';
import type { Dao } from './BaseRepository';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, inject } from 'tsyringe';

export enum QueryEntityTypes {
  Notebook = 'NOTEBOOK',
  Note = 'NOTE',
  All = 'All',
}

export interface Children {
  notes: Note[];
  notebooks: Notebook[];
}
@singleton()
export class NotebookRepository extends Repository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
  ) {
    super();
  }

  @emit('itemFetched')
  queryChildrenOf(
    notebook: Notebook | Notebook['id'],
    type: QueryEntityTypes,
  ): Promise<Children> {
    const notebookId = Notebook.isA(notebook) ? notebook.id : notebook;

    const notebooks =
      type === QueryEntityTypes.Note
        ? Promise.resolve([])
        : this.notebookDao!.all({ parentId: notebookId });

    const notes =
      type === QueryEntityTypes.Notebook
        ? Promise.resolve([])
        : this.noteDao!.all({ parentId: notebookId }, [
            'id',
            'title',
            'sortOrder',
            'userCreatedAt',
            'userModifiedAt',
            'parentId',
          ]);

    return Promise.all([notebooks, notes]).then(([notebooks, notes]) => {
      return {
        notes: notes.map((note) => {
          return Notebook.isA(notebook)
            ? Note.from(note, notebook)
            : Note.from(note);
        }),
        notebooks: notebooks.map((notebookDo) => {
          return Notebook.isA(notebook)
            ? Notebook.from(notebookDo, notebook)
            : Notebook.from(notebookDo);
        }),
      };
    });
  }

  async loadChildren(notebook: Notebook, notebookOnly: boolean, force = false) {
    if (notebook.isChildrenLoaded && !force) {
      return;
    }

    const { notebooks, notes } = await this.queryChildrenOf(
      notebook,
      notebookOnly ? QueryEntityTypes.Notebook : QueryEntityTypes.All,
    );
    notebook.children.value = notebookOnly
      ? notebooks
      : [...notebooks, ...notes];
  }

  @emit('itemFetched')
  async queryOrCreateRootNotebook(notebookChildrenOnly: boolean) {
    const root = await this.notebookDao!.one({ id: ROOT_NOTEBOOK_ID });
    const rootNotebook = root
      ? Notebook.from(root)
      : Notebook.createRootNotebook();

    if (!root) {
      await this.createNotebook(rootNotebook);
    }

    this.loadChildren(rootNotebook, notebookChildrenOnly);

    return rootNotebook;
  }

  @emit('notebookCreated')
  async createNotebook(notebook: Notebook) {
    await this.notebookDao!.create(notebook.toDo());
    return notebook;
  }

  async updateNotebook(notebook: Notebook) {
    await this.notebookDao!.update(notebook.toDo());
    return notebook;
  }
}
