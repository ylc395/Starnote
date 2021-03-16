import type { Entity,  Do, ObjectWithId } from 'domain/entity/abstract/Entity';
import EventEmitter from 'eventemitter3';

export type Query<T> = {
  [K in keyof T] ?: string | number | (string | number)[];
}

export interface Dao<T extends Entity> {
  one(query: Query<T>): Promise<Do<T> | null>;
  one<K extends keyof Do<T>>(
    query: Query<T>,
    fields: K[],
  ): Promise<Pick<Do<T>, K> | null>;

  all(query?: Query<T>): Promise<Do<T>[]>;
  all<K extends keyof Do<T>>(fields: K[]): Promise<Pick<Do<T>, K>[]>;
  all<K extends keyof Do<T>>(
    query: Query<T>,
    fields: K[],
  ): Promise<Pick<Do<T>, K>[]>;
  create(entity: Do<T>): Promise<void>; // 期望实现 findCreate 的语义
  update(patchEntity: Do<T> & ObjectWithId): Promise<void>;
  deleteById(id: string): Promise<void>;
}

export abstract class Repository extends EventEmitter { }

export function emit(succeedEventName: string, failedEventName?: string) {
  return function(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function(this: Repository, ...args: unknown[]) {
      const promise = original.apply(this, args);

      if (!(promise instanceof Promise)) {
        this.emit(succeedEventName);
        return promise;
      }
      promise.then((result: unknown) => this.emit(succeedEventName, result));

      if (failedEventName) {
        return promise.catch((err: unknown) => {
          this.emit(failedEventName, err);
          return Promise.reject(err);
        });
      }
      return promise;
    };
  };
}
