/* eslint-disable @typescript-eslint/no-explicit-any */
// @see https://2ality.com/2020/04/classes-as-values-typescript.html
type Class<T> = new (...args: any[]) => T;

function cast<T>(obj: any, TheClass?: Class<T>): T {
  if (TheClass && !(obj instanceof TheClass)) {
    throw new Error(`Not an instance of ${TheClass.name}: ${obj}`);
  }
  return obj;
}

export class KvStorage {
  private readonly map = new Map<any, any>();
  getItem<T>(key: any, type?: Class<T>) {
    const item = this.map.get(key);
    return cast(item, type);
  }

  setItem<T>(key: any, item: T, type?: Class<T>): this {
    cast(item, type);
    this.map.set(key, item);

    return this;
  }
}
