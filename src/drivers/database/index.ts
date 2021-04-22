import { IS_IN_ELECTRON } from 'utils/env';
import { container } from 'tsyringe';
import {
  NOTE_DAO_TOKEN,
  NOTEBOOK_DAO_TOKEN,
  STAR_DAO_TOKEN,
} from 'domain/repository';

export const ready: Promise<unknown> = new Promise((resolve) => {
  if (IS_IN_ELECTRON) {
    return import(/* webpackChunkName: "electron-env" */ './sqlite').then(
      ({ tablesReady, noteDao, notebookDao, starDao }) => {
        container.registerInstance(NOTE_DAO_TOKEN, noteDao);
        container.registerInstance(NOTEBOOK_DAO_TOKEN, notebookDao);
        container.registerInstance(STAR_DAO_TOKEN, starDao);
        tablesReady.then(resolve);
      },
    );
  }
});
