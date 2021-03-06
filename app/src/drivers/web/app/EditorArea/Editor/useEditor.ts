import { computed, onMounted, Ref, ref, watch, onUnmounted, inject } from 'vue';
import {
  Editor as MarkdownEditor,
  Events as MarkdownEditorEvents,
  wordCounter,
  lineCounter,
  cursorPosition,
  boldButton,
  italicButton,
  codeButton,
  strikeThroughButton,
  superscriptButton,
  subscriptButton,
  heading1Button,
  blockquoteButton,
  bulletListButton,
  orderedListButton,
  linkButton,
  imageButton,
  horizontalLineButton,
  taskButton,
  togglePreviewButton,
  toggleFullscreen,
  lintStatus,
} from '@ylc395/markdown-editor';
import '@ylc395/markdown-editor/dist/index.css';
import { Editor, TITLE_STATUS_TEXT } from 'domain/entity';
import { token as lintToken } from '../useLintWorker';

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

  let markdownEditor: MarkdownEditor;

  onMounted(async () => {
    const lintWorker = await inject(lintToken);

    markdownEditor = new MarkdownEditor(
      {
        el: editorRef.value!,
        value: editor.content.value,
        classNamePrefix: 'markdown-editor-',
        statusbar: [lintStatus, wordCounter, lineCounter, cursorPosition],
        toolbar: [
          boldButton,
          italicButton,
          codeButton,
          strikeThroughButton,
          superscriptButton,
          subscriptButton,
          heading1Button,
          blockquoteButton,
          bulletListButton,
          orderedListButton,
          linkButton,
          imageButton,
          horizontalLineButton,
          taskButton,
          togglePreviewButton,
          toggleFullscreen,
        ],
      },
      lintWorker,
    );

    let editingContent: null | string = null;

    markdownEditor.on(MarkdownEditorEvents.DocChanged, (content) => {
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
    );

    if (titleRef.value) {
      titleRef.value.value = editor.title.value;
    }

    if (editor.isJustCreated && titleRef.value) {
      titleRef.value.select();
    } else {
      markdownEditor.focus();
    }
  });

  onUnmounted(() => {
    markdownEditor.destroy();
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
