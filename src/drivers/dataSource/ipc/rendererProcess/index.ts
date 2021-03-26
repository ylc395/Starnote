import { container } from 'tsyringe';
import { NOTE_DAO_TOKEN, NOTEBOOK_DAO_TOKEN } from 'domain/repository';
import { daoAdaptor } from './adaptor';
import { EntityTypes } from 'domain/constant';

container.registerInstance(NOTE_DAO_TOKEN, daoAdaptor(EntityTypes.Note));

container.registerInstance(
  NOTEBOOK_DAO_TOKEN,
  daoAdaptor(EntityTypes.Notebook),
);
