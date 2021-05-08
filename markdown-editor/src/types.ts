import type { EditorView } from '@codemirror/view';
export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: (ToolbarButton | ToolbarButton['name'])[];
}

interface ToolbarButton {
  name: string;
  className: string;
  title: string;

  action: (view: EditorView) => void;
}
