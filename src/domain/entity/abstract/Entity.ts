import { v4 as uuid } from 'uuid';
import { Expose } from 'class-transformer';
import { hasIn, uniqueId } from 'lodash';

export interface ObjectWithId {
  id: string;
}

export function isWithId(obj: unknown): obj is ObjectWithId {
  return hasIn(obj, 'id');
}
export enum EntityTypes {
  Notebook = 'Notebook',
  Note = 'Note',
  Star = 'Star',
}

export abstract class Entity implements ObjectWithId {
  @Expose()
  readonly id = uuid();
  private readonly _id = uniqueId('entity-'); // for debugging

  isEqual(entity: unknown) {
    return this === entity;
  }
}
