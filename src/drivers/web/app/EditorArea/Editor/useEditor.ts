import { computed, onMounted, Ref, ref, watch, onUnmounted } from 'vue';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { Editor as MarkdownEditor } from 'drivers/web/components/MarkdownEditor';
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
    const markdownEditor = new MarkdownEditor({ el: editorRef.value! });
    const isNewNote = editor.isJustCreated;
    let editingContent: null | string = null;

    markdownEditor.event$.subscribe(({ event, data }) => {
      if (event === 'update') {
        editingContent = data;
        editor.setContent(data);
      }
    });

    watch(
      () => editor.noteTitle.value,
      (newTitle) => {
        if (titleRef.value && newTitle !== titleRef.value.value) {
          titleRef.value.value = newTitle;
        }
      },
      { immediate: true },
    );

    watch(
      () => editor.content.value,
      (newContent) => {
        if (editingContent === newContent) {
          return;
        }

        markdownEditor.setContent(newContent);
      },
      { immediate: true },
    );

    if (isNewNote && titleRef.value) {
      titleRef.value.select();
    } else {
      markdownEditor.focus();
    }

    onUnmounted(() => {
      markdownEditor.destroy();
    });
  });

  return {
    titleRef,
    editorRef,
    titleStatus,
    toggleAutoSave,
    resetTitle: editor.resetTitle,
  };
}
