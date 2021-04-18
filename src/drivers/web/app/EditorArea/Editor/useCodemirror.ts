import { onUnmounted, watch } from 'vue';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { defaultKeymap } from '@codemirror/commands';

import { Editor } from 'domain/entity';

export function useCodemirror(editor: Editor, el: HTMLElement) {
  const editorView = new EditorView({
    parent: el,
  });

  let content: string | null = null;
  watch(
    () => editor.content.value,
    (newContent) => {
      if (content === newContent) {
        return;
      }

      editorView.setState(
        EditorState.create({
          doc: editor.content.value,
          extensions: [
            markdown(),
            defaultHighlightStyle,
            keymap.of(defaultKeymap),
            EditorView.updateListener.of((v: ViewUpdate) => {
              if (v.docChanged) {
                content = v.state.doc.toJSON().join('\n');
                editor.setContent(content);
              }
            }),
          ],
        }),
      );
    },
    { immediate: true },
  );

  onUnmounted(() => {
    editorView.destroy();
  });

  return editorView;
}
