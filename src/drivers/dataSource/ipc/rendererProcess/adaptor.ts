import type { IpcRenderer } from 'electron';
import { Entity, EntityTypes } from 'domain/entity';
import type { Dao } from 'domain/repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ipcRender = (window as any).ipcRenderer as IpcRenderer;

export function daoAdaptor<E extends Entity>(entityName: EntityTypes): Dao<E> {
  return {
    all(...args: unknown[]) {
      return ipcRender.invoke('dataFetch', entityName, 'all', ...args);
    },
    one(...args: unknown[]) {
      return ipcRender.invoke('dataFetch', entityName, 'one', ...args);
    },
    create(...args) {
      return ipcRender.invoke('dataFetch', entityName, 'create', ...args);
    },
    update(...args) {
      return ipcRender.invoke('dataFetch', entityName, 'update', ...args);
    },
    deleteById(...args) {
      return ipcRender.invoke('dataFetch', entityName, 'deleteById', ...args);
    },
  };
}
