import { EditorState, Extension } from '@codemirror/state';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { languages } from '@codemirror/language-data';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { history } from '@codemirror/history';
import { EditorView } from '@codemirror/view';
import { showPanel } from '@codemirror/panel';
import { EditorOptions } from './types';
import { statusbar, toolbar } from './bar/bar';
export const createState = (
  options: Required<EditorOptions>,
  extensions: Extension[] = [],
): EditorState => {
  const panels = [];

  if (options.statusbar.length > 0) {
    panels.push(showPanel.of(statusbar(options.statusbar)));
  }

  if (options.toolbar.length > 0) {
    panels.push(showPanel.of(toolbar(options.toolbar)));
  }

  return EditorState.create({
    doc: options.value,
    extensions: [
      history(),
      markdown({
        // GFM parser. add some feature on commonMark
        // @see https://github.com/lezer-parser/markdown#user-content-gfm
        base: markdownLanguage,
        codeLanguages: languages,
        addKeymap: false,
      }),
      defaultHighlightStyle,
      EditorView.lineWrapping,
      ...panels,
      ...extensions,
    ],
  });
};
