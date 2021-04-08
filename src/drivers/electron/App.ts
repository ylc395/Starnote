import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import type { App as ElectronApp } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import {
  IS_DEVELOPMENT,
  IS_TEST,
  WEBPACK_DEV_SERVER_URL,
} from 'drivers/constants';
import { camelCase, isFunction } from 'lodash';

export class App {
  private readonly electronApp = app;
  private readonly ipcMain = ipcMain;
  start() {
    // @see https://github.com/electron/electron/issues/22119
    // when this issue closed, remove this line
    this.electronApp.allowRendererProcessReuse = false;

    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true } },
    ]);

    // Exit cleanly on request from parent process in development mode.
    if (IS_DEVELOPMENT) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            this.electronApp.quit();
          }
        });
      } else {
        process.on('SIGTERM', () => {
          this.electronApp.quit();
        });
      }
    }
    // Quit when all windows are closed.
    this.electronApp.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        this.electronApp.quit();
      }
    });

    this.electronApp.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        App.createWindow();
      }
    });

    this.ipcMain.on('getAppInfo', (event, infoField: string, ...args) => {
      const methodName = camelCase(`get-${infoField}`) as keyof ElectronApp;

      if (!isFunction(this.electronApp[methodName])) {
        throw new Error(`${methodName} is invalid`);
      }

      event.returnValue = (this.electronApp[methodName] as (
        ...args: unknown[]
      ) => unknown)(...args);
    });
  }

  static async createWindow(devPath = '', prodPath = 'index.html') {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        webSecurity: false, // disabled same-site policy for git
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
      },
    });

    if (WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(WEBPACK_DEV_SERVER_URL + devPath);

      if (!IS_TEST) {
        win.webContents.openDevTools();
      }
    } else {
      createProtocol('app');
      // Load the index.html when not in development
      win.loadURL(`app://./${prodPath}`);
    }
  }
}
