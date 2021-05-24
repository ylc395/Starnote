import type { BarItem } from './panel/bar';
import { syntaxTree } from '@codemirror/language';

export interface EditorOptions {
  el: HTMLElement;
  value?: string;
  toolbar?: BarItem[];
  statusbar?: BarItem[];
}

export type SyntaxTree = ReturnType<typeof syntaxTree>;
export type SyntaxNode = ReturnType<SyntaxTree['resolve']>;
