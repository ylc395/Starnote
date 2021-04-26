import fs from 'fs-extra';
import { wrap } from 'lodash';
import logger from 'drivers/logger';

const debug = logger.debug.bind(logger, 'fs');
const cache = new WeakMap();
export default new Proxy(fs, {
  get(target, key) {
    const value = Reflect.get(target, key);

    if (typeof value !== 'function') {
      return value;
    }
    if (!cache.has(value)) {
      cache.set(
        value,
        wrap(debug, (debug, ...args: unknown[]) => {
          debug({ action: key, args });
          return value(...args);
        }),
      );
    }
    return cache.get(value);
  },
});
