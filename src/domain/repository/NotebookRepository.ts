/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Notebook,
  Note,
  ROOT_NOTEBOOK_ID,
  NotebookWithoutParent,
  NoteWithoutParent,
} from 'domain/entity';
import { emit, Repository } from './BaseRepository';
import type { Dao } from './BaseRepository';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, inject } from 'tsyringe';
import { EntityTypes } from 'domain/constant';

export enum NotebookEvents {
  ItemFetched = 'ITEM_FETCHED',
  NoteFetched = 'NOTE_FETCHED',
  NotebookFetched = 'NOTEBOOK_FETCHED',
  NotebookCreated = 'NOTEBOOK_CREATED',
}

export interface Children {
  notes: Note[];
  notebooks: Notebook[];
}

export interface UnidirectionalChildren {
  notes: NoteWithoutParent[];
  notebooks: NotebookWithoutParent[];
}
@singleton()
export class NotebookRepository extends Repository {
  constructor(
    @inject(NOTE_DAO_TOKEN) protected noteDao?: Dao<Note>,
    @inject(NOTEBOOK_DAO_TOKEN) protected notebookDao?: Dao<Notebook>,
  ) {
    super();
  }

  queryChildrenOf(notebook: Notebook, type?: EntityTypes): Promise<Children>;
  queryChildrenOf(
    notebook: Notebook['id'],
    type?: EntityTypes,
  ): Promise<UnidirectionalChildren>;
  @emit(NotebookEvents.ItemFetched)
  queryChildrenOf(
    notebook: Notebook | Notebook['id'],
    type?: EntityTypes,
  ): Promise<Children | UnidirectionalChildren> {
    const notebookId = Notebook.isA(notebook) ? notebook.id : notebook;

    const notebooks =
      type === EntityTypes.Note
        ? Promise.resolve([])
        : this.notebookDao!.all({ parentId: notebookId });

    const notes =
      type === EntityTypes.Notebook
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
      const result = {
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

      this.emit(NotebookEvents.NotebookFetched, result.notebooks);
      this.emit(NotebookEvents.NoteFetched, result.notes);
      return result;
    });
  }

  @emit(NotebookEvents.NotebookFetched)
  @emit(NotebookEvents.ItemFetched)
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

  @emit(NotebookEvents.NotebookCreated)
  async createNotebook(notebook: Notebook) {
    await this.notebookDao!.create(notebook.toDo());
    return notebook;
  }

  async updateNotebook(notebook: Notebook) {
    await this.notebookDao!.update(notebook.toDo());
    return notebook;
  }
}
