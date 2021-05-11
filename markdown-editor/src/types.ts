import type { BarItem } from './bar/bar';

export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: BarItem[];
  statusbar?: BarItem[];
}
