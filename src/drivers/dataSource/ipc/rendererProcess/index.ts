import { container } from 'tsyringe';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from 'domain/repository';
import { daoAdaptor } from './adaptor';
import { EntityNames } from '../interface';

container.registerInstance(NOTE_DAO_TOKEN, daoAdaptor(EntityNames.Note));

container.registerInstance(
  NOTEBOOK_DAO_TOKEN,
  daoAdaptor(EntityNames.Notebook),
);
