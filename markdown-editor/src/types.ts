import type { StatusbarItem } from './statusbar';
import type { ToolbarItem } from './toolbar';

export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: ToolbarItem[];
  statusbar?: StatusbarItem[];
}
