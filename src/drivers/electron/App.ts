import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import installExtension from 'electron-devtools-installer';
import {
  IS_DEVELOPMENT,
  IS_TEST,
  WEBPACK_DEV_SERVER_URL,
  OS_PLATFORM,
} from 'drivers/platform/os/constants';

export class App {
  private readonly electronApp = app;
  start() {
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true } },
    ]);

    // Exit cleanly on request from parent process in development mode.
    if (IS_DEVELOPMENT) {
      if (OS_PLATFORM === 'win32') {
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
      if (OS_PLATFORM !== 'darwin') {
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

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // this.electronApp.on('ready', async () => {
    //   if (IS_DEVELOPMENT && !IS_TEST) {
    // Install Vue Devtools
    // try {
    // https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg?hl=en
    //         const VUEJS_DEVTOOLS = 'ljjemllljcmogpfapbkkighbhhppjdbg';
    //         await installExtension(VUEJS_DEVTOOLS);
    //       } catch (e) {
    //         console.error('Vue Devtools failed to install:', e.toString());
    //       }
    //     }
    //   });
  }

  static async createWindow(devPath = '', prodPath = 'index.html') {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // see file: vue.config.js
        webSecurity: false, // disabled same-site policy for git
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
