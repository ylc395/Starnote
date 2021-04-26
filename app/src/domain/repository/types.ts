import type { ObjectWithId } from 'domain/entity/abstract/Entity';

export type Query<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]?: T[K] extends object ? never : T[K];
};

export interface Dao<T> {
  one(query: Query<T>): Promise<T | null>;
  one<K extends keyof T>(
    query: Query<T>,
    fields: K[],
  ): Promise<Pick<T, K> | null>;

  all(query?: Query<T>): Promise<T[]>;
  all<K extends keyof T>(fields: K[]): Promise<Pick<T, K>[]>;
  all<K extends keyof T>(query: Query<T>, fields: K[]): Promise<Pick<T, K>[]>;
  create(entity: T): Promise<void>; // 期望实现 findCreate 的语义
  update(patchEntity: T & ObjectWithId): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteByIds(ids: string[]): Promise<void>;
}
