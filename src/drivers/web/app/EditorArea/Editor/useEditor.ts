import { onMounted, onUnmounted, Ref, ref } from 'vue';
import type { EditorView } from '@codemirror/view';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { codemirrorEditor } from './codemirrorEditor';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  const titleStatus = ref('');
  const checkTitle = (title: string) => {
    titleStatus.value = TITLE_STATUS_TEXT[editor.checkTitle(title)];
  };

  const setTitle = (title: string) => {
    if (titleStatus.value) {
      titleRef.value!.value = editor.title.value;
      titleStatus.value = '';
      return;
    }

    editor.setTitle(title);
  };

  let codeMirrorEditor: EditorView | null = null;

  onMounted(() => {
    codeMirrorEditor = codemirrorEditor(editor, editorRef.value!);
    const isNewNote = editor.isJustCreated;

    if (titleRef.value) {
      titleRef.value.value = editor.title.value;
    }

    if (isNewNote && titleRef.value) {
      titleRef.value.select();
    } else {
      codeMirrorEditor.focus();
    }
  });

  onUnmounted(() => {
    codeMirrorEditor?.destroy();
  });

  return { titleRef, editorRef, titleStatus, checkTitle, setTitle };
}
