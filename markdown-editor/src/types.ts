import type { BarItem } from './panel/bar';

export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: BarItem[];
  statusbar?: BarItem[];
}
