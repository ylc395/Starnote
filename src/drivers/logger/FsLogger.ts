import { writeFile, removeSync } from 'fs-extra';
import { join } from 'path';
import Logger from 'js-logger';

import { APP_DIRECTORY } from 'drivers/electron/constants';
import formatter from './formatter';

const LOG_FILE = join(APP_DIRECTORY, 'log.txt');
const defaultHandler = Logger.createDefaultHandler();

removeSync(LOG_FILE);

Logger.setLevel(Logger.DEBUG);
Logger.setHandler((messages, context) => {
  const formattedMessage = formatter(messages, context);
  defaultHandler([formattedMessage], context);
  writeFile(LOG_FILE, `${formattedMessage}\n`, {
    flag: 'a+',
  });
});

export default Logger;
