import { container } from 'tsyringe';
import {
  NOTE_DAO_TOKEN,
  NOTEBOOK_DAO_TOKEN,
  STAR_DAO_TOKEN,
} from 'domain/repository';
import { noteDao, notebookDao, starDao, tablesReady } from './db';

export const ready: Promise<unknown> = new Promise((resolve) => {
  container.registerInstance(NOTE_DAO_TOKEN, noteDao);
  container.registerInstance(NOTEBOOK_DAO_TOKEN, notebookDao);
  container.registerInstance(STAR_DAO_TOKEN, starDao);
  tablesReady.then(resolve);
});
