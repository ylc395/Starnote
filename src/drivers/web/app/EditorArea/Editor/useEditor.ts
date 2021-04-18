import { computed, onMounted, Ref, ref, watch } from 'vue';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { useCodemirror } from './useCodemirror';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  const titleStatus = computed(
    () => TITLE_STATUS_TEXT[editor.titleStatus.value],
  );

  onMounted(() => {
    const codeMirrorEditor = useCodemirror(editor, editorRef.value!);
    const isNewNote = editor.isJustCreated;

    watch(
      () => editor.noteTitle.value,
      (newTitle) => {
        if (titleRef.value && newTitle !== titleRef.value.value) {
          titleRef.value.value = newTitle;
        }
      },
      { immediate: true },
    );

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
    resetTitle() {
      if (titleStatus.value) {
        titleRef.value!.value = editor.noteTitle.value;
        editor.resetTitle();
      }
    },
  };
}
