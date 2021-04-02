import { Editor } from 'domain/entity';

import { EditorView, ViewUpdate, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle } from '@codemirror/highlight';

export function codemirrorEditor(editor: Editor, el: HTMLElement) {
  return new EditorView({
    parent: el,
    state: EditorState.create({
      doc: editor.content.value,
      extensions: [
        markdown(),
        defaultHighlightStyle,
        keymap.of(defaultKeymap),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            editor.content.value = v.state.doc.toJSON().join('\n');
          }
        }),
      ],
    }),
  });
}
