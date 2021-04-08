import { isRenderer } from './utils';
import path from 'path';
import { app, ipcRenderer } from 'electron';

export const APP_NAME = 'starNote';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
export const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;
export const IS_IN_ELECTRON = process.env.IS_ELECTRON;
export const IS_IN_ELECTRON_RENDERER = IS_IN_ELECTRON && isRenderer();
export const APP_DIRECTORY = IS_IN_ELECTRON
  ? path.join(
      IS_IN_ELECTRON_RENDERER
        ? ipcRenderer.sendSync('getAppInfo', 'path', 'home')
        : app.getPath('home'),
      '.config',
      IS_DEVELOPMENT ? `${APP_NAME}-test` : APP_NAME,
    )
  : '';
