import os from 'os';
import path from 'path';
import { IS_DEVELOPMENT, APP_NAME } from '../common/constants';

export const OS_PLATFORM = process.platform;
export const APP_DIRECTORY = path.join(
  os.homedir(),
  '.config',
  IS_DEVELOPMENT ? `${APP_NAME}-test` : APP_NAME,
);

export * from '../common/constants';
