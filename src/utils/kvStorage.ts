// @see https://2ality.com/2020/04/classes-as-values-typescript.html
import { get, hasIn, isNil } from 'lodash';
import { Class } from './types';
function cast<T>(obj: unknown, TheClass?: Class<T>): T | never {
  if (TheClass && !(obj instanceof TheClass)) {
    throw new Error(`Not an instance of ${TheClass.name}: ${obj}`);
  }
  return obj as T;
}

export class KvStorage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly map = new Map<unknown, any>();
  getItem<T>(key: unknown, type?: Class<T>): T | never {
    const item = this.map.get(key);

    if (isNil(item)) {
      throw new Error(`no item for key ${key}`);
    }

    return cast(item, type);
  }

  setItem<T>(key: unknown | unknown[], item: T, type?: Class<T>): this {
    if (isNil(key)) {
      throw new Error(`invalid key: ${key}`);
    }

    if (isNil(item)) {
      throw new Error(`invalid item for key ${key}: ${item}`);
    }

    cast(item, type);
    this.map.set(key, item);

    return this;
  }
  setItems(items: unknown[], keyField = 'id') {
    items.forEach((item) => {
      if (!hasIn(item, keyField)) {
        throw new Error(`no key field "${keyField}"`);
      }

      this.setItem(get(item, keyField), item);
    });
  }

  remove(itemKey: unknown | unknown[]) {
    if (Array.isArray(itemKey)) {
      itemKey.forEach(this.map.delete.bind(this.map));
    } else {
      this.map.delete(itemKey);
    }
  }
}
