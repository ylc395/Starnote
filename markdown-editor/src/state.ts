import { EditorState } from '@codemirror/state';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { languages } from '@codemirror/language-data';
import { markdown } from '@codemirror/lang-markdown';
import { history } from '@codemirror/history';
import { EditorOptions } from './types';

export const createState = (options: EditorOptions): EditorState => {
  return EditorState.create({
    doc: options.value || '',
    extensions: [
      history(),
      markdown({
        codeLanguages: languages,
        addKeymap: false,
      }),
      defaultHighlightStyle,
    ],
  });
};
