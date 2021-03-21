import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { classToPlain, plainToClass, Transform } from 'class-transformer';
import type { Dayjs } from 'dayjs';
import { ref, shallowRef } from '@vue/reactivity';
import type { ComputedRef, Ref, UnwrapRef } from '@vue/reactivity';
import { Class } from 'utils/types';
import { TIME_FORMAT } from 'domain/constant';
import { hasIn } from 'lodash';

dayjs.extend(customParseFormat);

type DataPropertyNames<T> = {
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
export abstract class Entity {
  readonly id: string = uuid();

  toDo() {
    return classToPlain(this) as ObjectWithId;
  }

  isEqual(entity: Entity | null | undefined) {
    return this.id === entity?.id;
  }
}

export const dataObjectToInstance = <T>(
  aClass: Class<T>,
  dataObject: Record<string, unknown>,
) =>
  plainToClass(aClass, dataObject, {
    exposeDefaultValues: true,
  });

export const RefTransform = (target: Entity, propertyName: string) => {
  const toClass = Transform(({ value }) => ref(value), { toClassOnly: true });
  const toPlain = Transform(({ value }) => value.value, { toPlainOnly: true });

  toClass(target, propertyName);
  toPlain(target, propertyName);
};

export const DayjsRefTransform = (target: Entity, propertyName: string) => {
  const toClass = Transform(
    ({ value }) => shallowRef(dayjs(value, TIME_FORMAT)),
    { toClassOnly: true },
  );
  const toPlain = Transform(({ value }) => value.value.format(TIME_FORMAT), {
    toPlainOnly: true,
  });

  toClass(target, propertyName);
  toPlain(target, propertyName);
};
