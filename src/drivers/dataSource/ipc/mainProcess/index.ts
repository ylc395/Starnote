import { ipcMain } from 'electron';
import type { Dao } from 'domain/repository';
import { noteDao, notebookDao } from 'drivers/dataSource/sqlite';
import { EntityTypes } from 'domain/constant';

type DaoMethods = keyof Dao<never>;

const sqliteSourceMap = {
  [EntityTypes.Note]: noteDao,
  [EntityTypes.Notebook]: notebookDao,
};

ipcMain.handle(
  'dataFetch',
  (_, entityName: EntityTypes, method: DaoMethods, ...args) => {
    const source = sqliteSourceMap[entityName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (source[method] as any)(...args);
  },
);
