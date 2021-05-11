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
        // with GFM and some other extensions enabled
        // @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
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
