import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { classToPlain, plainToClass } from "class-transformer";
import type { Dayjs } from "dayjs";
import type { ComputedRef, Ref, UnwrapRef } from '@vue/runtime-core';
import { Class } from 'utils/types';

dayjs.extend(customParseFormat);

type DataPropertyNames<T> = {
  [K in keyof T]: K extends string
      ? T[K] extends (Function | ComputedRef)
        ? never
        : K
      : never
}[keyof T];

type Unwrap<T> = T extends Dayjs ? string : T extends object ? Do<T> : T
export type Do<T> = {
  readonly [P in DataPropertyNames<T>]?: T[P] extends Ref
    ? Unwrap<UnwrapRef<T[P]>>
    : Unwrap<T[P]>
};

export interface ObjectWithId {
  id: string;
}
export abstract class Entity {
  readonly id: string = uuid();

  toDo() {
    return classToPlain(this) as ObjectWithId;
  }
}

export const dataObjectToInstance = <T>(aClass: Class<T>, dataObject: Record<string, unknown>) => plainToClass(aClass, dataObject, {exposeDefaultValues: true})