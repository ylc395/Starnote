import { IS_IN_ELECTRON } from 'drivers/env';
import { container } from 'tsyringe';
import {
  NOTE_DAO_TOKEN,
  NOTEBOOK_DAO_TOKEN,
  STAR_DAO_TOKEN,
} from 'domain/repository';

export class Database {
  readonly ready = new Promise((resolve) => {
    if (IS_IN_ELECTRON) {
      this.initSqlite().then(resolve);
    }
  });

  private initSqlite() {
    return import('./sqlite').then(
      ({ tablesReady, noteDao, notebookDao, starDao }) => {
        container.registerInstance(NOTE_DAO_TOKEN, noteDao);
        container.registerInstance(NOTEBOOK_DAO_TOKEN, notebookDao);
        container.registerInstance(STAR_DAO_TOKEN, starDao);
        return tablesReady;
      },
    );
  }
}
