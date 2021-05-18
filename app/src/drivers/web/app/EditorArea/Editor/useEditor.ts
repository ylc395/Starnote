import { computed, onMounted, Ref, ref, watch, onUnmounted } from 'vue';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import {
  Editor as MarkdownEditor,
  Events as MarkdownEditorEvents,
  wordCounter,
  lineCounter,
  cursorPosition,
  boldIcon,
  italicIcon,
  codeIcon,
  strikeThroughIcon,
  superscriptIcon,
  subscriptIcon,
  heading1Icon,
  blockquoteIcon,
  bulletListIcon,
  orderedListIcon,
  linkIcon,
  imageIcon,
  horizontalLineIcon,
  taskIcon,
} from '@ylc395/markdown-editor';
import '@ylc395/markdown-editor/dist/index.css';

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
    const markdownEditor = new MarkdownEditor({
      el: editorRef.value!,
      statusbar: [wordCounter, lineCounter, cursorPosition],
      toolbar: [
        boldIcon,
        italicIcon,
        codeIcon,
        strikeThroughIcon,
        superscriptIcon,
        subscriptIcon,
        heading1Icon,
        blockquoteIcon,
        bulletListIcon,
        orderedListIcon,
        linkIcon,
        imageIcon,
        horizontalLineIcon,
        taskIcon,
      ],
    });

    const isNewNote = editor.isJustCreated;
    let editingContent: null | string = null;

    markdownEditor.on(MarkdownEditorEvents.Updated, (content) => {
      editingContent = content;
      editor.setContent(content);
    });

    watch(
      () => editor.content.value,
      (newContent) => {
        if (editingContent !== newContent) {
          // editor content is modified by app, instead of user
          markdownEditor.setContent(newContent);
        }
      },
      { immediate: true },
    );

    if (titleRef.value) {
      titleRef.value.value = editor.title.value;
    }

    if (isNewNote && titleRef.value) {
      titleRef.value.select();
    } else {
      markdownEditor.focus();
    }

    onUnmounted(() => {
      markdownEditor.destroy();
    });
  });

  const resetTitle = () => {
    if (!titleRef.value) {
      return;
    }

    titleRef.value.value = editor.title.value;
    editor.resetTitleStatus();
  };

  return {
    titleRef,
    editorRef,
    titleStatus,
    toggleAutoSave,
    resetTitle,
  };
}
