import { onUnmounted } from 'vue';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { defaultKeymap } from '@codemirror/commands';

import { Editor } from 'domain/entity';

export function useCodemirror(editor: Editor, el: HTMLElement) {
  const editorView = new EditorView({
    parent: el,
    state: EditorState.create({
      extensions: [
        markdown(),
        defaultHighlightStyle,
        keymap.of(defaultKeymap),

        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            editor.setContent(v.state.doc.toJSON().join('\n'));
          }
        }),
      ],
    }),
  });

  onUnmounted(() => {
    editorView.destroy();
  });

  return editorView;
}
