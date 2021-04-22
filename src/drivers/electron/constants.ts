import path from 'path';
import { app, ipcRenderer } from 'electron';
import {
  IS_IN_ELECTRON,
  IS_IN_ELECTRON_RENDERER,
  IS_DEVELOPMENT,
} from 'utils/env';

export const APP_NAME = 'Starnote';
export const APP_DIRECTORY = IS_IN_ELECTRON
  ? path.join(
      IS_IN_ELECTRON_RENDERER
        ? ipcRenderer.sendSync('getAppInfo', 'path', 'home')
        : app.getPath('home'),
      '.config',
      IS_DEVELOPMENT ? `${APP_NAME}-test` : APP_NAME,
    )
  : '';
