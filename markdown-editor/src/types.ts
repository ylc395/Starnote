import type { EditorView, ViewUpdate } from '@codemirror/view';
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

export interface StatusbarItem {
  className: string;
  onInitialize: (view: EditorView, itemEl: HTMLElement) => void;
  onUpdate: (update: ViewUpdate, view: EditorView, itemEl: HTMLElement) => void;
}
