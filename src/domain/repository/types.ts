import type { Entity, Do, ObjectWithId } from 'domain/entity/abstract/Entity';

export type Query<T> = {
  [K in keyof T]?: string | number | (string | number)[];
};

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
