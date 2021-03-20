// @see https://www.electronjs.org/docs/api/browser-window preload
import { ipcRenderer } from 'electron';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).ipcRenderer = ipcRenderer;
