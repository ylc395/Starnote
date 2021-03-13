import { ipcMain } from "electron";
import type { Dao } from "domain/repository";
import { noteDao, notebookDao } from "drivers/dataSource/sqlite";
import { EntityNames } from "../interface";

type DaoMethods = keyof Dao<never>;

const sqliteSourceMap = {
    [EntityNames.Note]: noteDao, 
    [EntityNames.Notebook]: notebookDao,
};

ipcMain.handle('dataFetch', (_, EntityName: EntityNames, method: DaoMethods, ...args) => {
    const source = sqliteSourceMap[EntityName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (source[method] as any)(...args);
});