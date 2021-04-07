import { onMounted, onUnmounted, Ref, ref } from 'vue';
import type { EditorView } from '@codemirror/view';
import type { Editor } from 'domain/entity';
import { codemirrorEditor } from './codemirrorEditor';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  let codeMirrorEditor: EditorView | null = null;

  onMounted(() => {
    codeMirrorEditor = codemirrorEditor(editor, editorRef.value!);
    const isNewNote = editor.note.value!.isJustCreated;

    if (isNewNote && titleRef.value) {
      titleRef.value.select();
    } else {
      codeMirrorEditor.focus();
    }
  });

  onUnmounted(() => {
    codeMirrorEditor?.destroy();
  });

  return { titleRef, editorRef };
}
