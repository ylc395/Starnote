import { container } from 'tsyringe';
import {
  NOTE_DAO_TOKEN,
  NOTEBOOK_DAO_TOKEN,
  STAR_DAO_TOKEN,
} from 'domain/repository';
import { noteDao } from './dao/noteDao';
import { notebookDao } from './dao/notebookDao';
import { starDao } from './dao/starDao';

export { tablesReady } from './table';

container.registerInstance(NOTE_DAO_TOKEN, noteDao);
container.registerInstance(NOTEBOOK_DAO_TOKEN, notebookDao);
container.registerInstance(STAR_DAO_TOKEN, starDao);
