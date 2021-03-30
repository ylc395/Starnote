import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  classToPlain,
  Expose,
  plainToClass,
  Transform,
} from 'class-transformer';
import type { Dayjs } from 'dayjs';
import { ref, shallowRef } from '@vue/reactivity';
import type { ComputedRef, Ref, UnwrapRef } from '@vue/reactivity';
import { Class } from 'utils/types';
import { hasIn } from 'lodash';

dayjs.extend(customParseFormat);

export type DataPropertyNames<T> = {
  [K in keyof T]: K extends string
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      T[K] extends Function | ComputedRef
      ? never
      : K
    : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/ban-types
type Unwrap<T> = T extends Dayjs ? string : T extends object ? Do<T> : T;
export type Do<T> = {
  readonly [P in DataPropertyNames<T>]?: T[P] extends Ref
    ? Unwrap<UnwrapRef<T[P]>>
    : Unwrap<T[P]>;
};

export interface ObjectWithId {
  id: string;
}

export function isWithId(obj: unknown): obj is ObjectWithId {
  return hasIn(obj, 'id');
}
export enum EntityTypes {
  Notebook = 'NOTEBOOK',
  Note = 'NOTE',
}

export abstract class Entity {
  @Expose()
  readonly id: string = uuid();

  toDo() {
    return classToPlain(this, { strategy: 'excludeAll' }) as ObjectWithId;
  }

  isEqual(entity: unknown) {
    return this === entity;
  }
}

export const dataObjectToInstance = <T>(
  aClass: Class<T>,
  dataObject: Record<string, unknown>,
) =>
  plainToClass(aClass, dataObject, {
    exposeDefaultValues: true,
    excludeExtraneousValues: true,
  });

export const RefTransform = (target: Entity, propertyName: string) => {
  const toClass = Transform(({ value }) => ref(value), { toClassOnly: true });
  const toPlain = Transform(({ value }) => value.value, { toPlainOnly: true });
  const expose = Expose();

  toClass(target, propertyName);
  toPlain(target, propertyName);
  expose(target, propertyName);
};

export const DayjsRefTransform = (target: Entity, propertyName: string) => {
  const TIME_DATA_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS Z';
  const toClass = Transform(
    ({ value }) => shallowRef(dayjs(value, TIME_DATA_FORMAT)),
    { toClassOnly: true },
  );

  const toPlain = Transform(
    ({ value }) => value.value.format(TIME_DATA_FORMAT),
    {
      toPlainOnly: true,
    },
  );
  const expose = Expose();

  toClass(target, propertyName);
  toPlain(target, propertyName);
  expose(target, propertyName);
};
