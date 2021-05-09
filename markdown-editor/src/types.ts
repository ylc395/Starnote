import type { EditorView } from '@codemirror/view';
import type { StatusbarItem } from './statusbar';

export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: ToolbarItem[];
  statusbar?: StatusbarItem[];
}

interface ToolbarItem {
  className: string;
  title: string;

  action: (view: EditorView) => void;
}
