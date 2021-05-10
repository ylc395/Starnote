import { EditorState, Extension } from '@codemirror/state';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { languages } from '@codemirror/language-data';
import { markdown } from '@codemirror/lang-markdown';
import { history } from '@codemirror/history';
import { EditorView } from '@codemirror/view';
import { EditorOptions } from './types';
import { getStatusbar } from './statusbar/bar';
import { getToolbar } from './toolbar/bar';

export const createState = (
  options: Required<EditorOptions>,
  extensions: Extension[] = [],
): EditorState => {
  return EditorState.create({
    doc: options.value,
    extensions: [
      history(),
      markdown({
        codeLanguages: languages,
        addKeymap: false,
      }),
      defaultHighlightStyle,
      EditorView.lineWrapping,
      ...(options.statusbar.length > 0
        ? [getStatusbar(options.statusbar)]
        : []),
      ...(options.toolbar.length > 0 ? [getToolbar(options.toolbar)] : []),
      ...extensions,
    ],
  });
};
