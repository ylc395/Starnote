import { Note, Notebook } from 'domain/entity';
import { daoAdaptor } from './adaptor';
import { NoteModel } from './model/NoteModel';
import { NotebookModel } from './model/NotebookModel';
import { db } from './db';
import { IS_DEVELOPMENT } from 'drivers/platform/common/constants';

export const noteDao = daoAdaptor<Note>(NoteModel);
export const notebookDao = daoAdaptor<Notebook>(NotebookModel, {
  include: { model: NoteModel, as: 'indexNote' },
});

db.sync({ force: IS_DEVELOPMENT });
