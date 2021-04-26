import {
  Notebook,
  NotebookDataObject,
  isWithId,
  Note,
  ROOT_NOTEBOOK_ID,
} from 'domain/entity';
import { NOTEBOOK_DAO_TOKEN, NOTE_DAO_TOKEN } from './daoTokens';
import { singleton, container } from 'tsyringe';
import { groupBy, pick, unary } from 'lodash';

@singleton()
export class NotebookRepository {
  private readonly noteDao = container.resolve(NOTE_DAO_TOKEN);
  private readonly notebookDao = container.resolve(NOTEBOOK_DAO_TOKEN);

  async fetchTree() {
    const treeItems = await Promise.all([
      this.notebookDao.all().then((objs) => objs.map(unary(Notebook.from))),
      this.noteDao
        .all([
          'id',
          'title',
          'sortOrder',
          'userCreatedAt',
          'userModifiedAt',
          'parentId',
        ])
        .then((objs) => objs.map(unary(Note.from))),
    ]).then(([notebooks, notes]) => [...notebooks, ...notes]);

    const indexedItem = groupBy(treeItems, 'id');
    const itemsInRoot = [];

    for (const item of treeItems) {
      const parentId = item.parentId;

      if (!parentId || item.parentId === ROOT_NOTEBOOK_ID) {
        itemsInRoot.push(item);
        continue;
      }

      const parent = indexedItem[parentId][0] as Notebook;

      if (item.id === parent.indexNoteId) {
        continue;
      }

      item.setParent(parent, true);
    }

    return itemsInRoot;
  }

  async createNotebook(notebook: Notebook) {
    await this.notebookDao.create(notebook.toDataObject());
    return notebook;
  }

  async updateNotebook<T extends keyof NotebookDataObject>(
    notebook: Notebook,
    fields?: T[],
  ) {
    const payload = fields
      ? pick(notebook.toDataObject(), [...fields, 'id'])
      : notebook.toDataObject();

    if (!isWithId(payload)) {
      throw new Error('no id when update notebook');
    }

    await this.notebookDao.update(payload);
    return notebook;
  }

  deleteNotebook(notebook: Notebook) {
    return this.notebookDao.deleteById(notebook.id);
  }
}
