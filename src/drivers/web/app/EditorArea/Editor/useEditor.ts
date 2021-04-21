import { computed, onMounted, Ref, ref, watch } from 'vue';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { useCodemirror } from './useCodemirror';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  const titleStatus = computed(
    () => TITLE_STATUS_TEXT[editor.titleStatus.value],
  );

  const toggleAutoSave = () => {
    const activeEl = document.activeElement;
    if (
      titleRef.value?.contains(activeEl) ||
      editorRef.value?.contains(activeEl)
    ) {
      editor.startAutoSave();
    } else {
      editor.stopAutoSave();
    }
  };

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
    toggleAutoSave,
    resetTitle: editor.resetTitle,
  };
}
