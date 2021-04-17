import { computed, onMounted, Ref, ref } from 'vue';
import type { EditorView } from '@codemirror/view';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { useCodemirror } from './useCodemirror';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  const titleStatus = computed(
    () => TITLE_STATUS_TEXT[editor.titleStatus.value],
  );

  let codeMirrorEditor: EditorView | null = null;

  onMounted(() => {
    codeMirrorEditor = useCodemirror(editor, editorRef.value!);
    const isNewNote = editor.isJustCreated;

    if (titleRef.value) {
      titleRef.value.value = editor.noteTitle;
    }

    if (isNewNote && titleRef.value) {
      titleRef.value.select();
    } else {
      codeMirrorEditor.focus();
    }
  });

  return {
    titleRef,
    editorRef,
    titleStatus,
    setTitle: editor.setTitle,
    resetTitle() {
      if (titleStatus.value) {
        titleRef.value!.value = editor.noteTitle;
        editor.resetTitleStatus();
      }
    },
  };
}
