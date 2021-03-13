import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Dayjs } from "dayjs";
import { ComputedRef, isReadonly, isRef, Ref, unref, UnwrapRef } from '@vue/runtime-core';
import { TIME_FORMAT } from 'domain/constant';

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
export class Entity {
  readonly id: string;
  constructor(dto: Partial<ObjectWithId>) {
    this.id = dto.id || uuid();
  }
  // convert to Data Object
  toDo(): Do<this> & ObjectWithId {
    return JSON.parse(JSON.stringify(this, (key, value) => {
      if (isReadonly(value)) {
        return;
      }

      const rawValue = isRef(value) ? unref(value) : value;

      if (rawValue instanceof dayjs) {
        return (rawValue as Dayjs).format(TIME_FORMAT);
      }
      return rawValue;
    }));
  }
}
