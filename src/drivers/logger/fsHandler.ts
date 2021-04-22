import { writeFile, remove } from 'fs-extra';
import { join } from 'path';
import { APP_DIRECTORY } from 'drivers/electron/constants';

const LOG_FILE = join(APP_DIRECTORY, 'log.txt');

export const removed = remove(LOG_FILE);

export function writeToFile([prefix, log]: [string, string]) {
  writeFile(LOG_FILE, `${prefix}${log}\n`, {
    flag: 'a+',
  });
}
