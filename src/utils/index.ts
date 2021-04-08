import { isUndefined } from 'lodash';

export function selfish<T>(target: T) {
  const cache = new WeakMap();
  return new Proxy(target as never, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    },
  }) as T;
}

export class SafeMap<K, V> extends Map<K, V> {
  get(key: K) {
    const item = super.get(key);

    if (isUndefined(item)) {
      throw new Error('wrong key when get item from map');
    }

    return item;
  }
}
