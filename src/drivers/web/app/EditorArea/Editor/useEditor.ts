import { onMounted, onUnmounted, Ref, ref } from 'vue';
import type { EditorView } from '@codemirror/view';
import { Editor, TitleStatus } from 'domain/entity';
import { codemirrorEditor } from './codemirrorEditor';
export function useEditor(editor: Editor) {
  const titleRef: Ref<HTMLInputElement | null> = ref(null);
  const editorRef: Ref<HTMLElement | null> = ref(null);
  const titleStatus = ref('');
  const checkTitle = (title: string) => {
    const messages = {
      [TitleStatus.DuplicatedError]: '重复的标题',
      [TitleStatus.EmptyError]: '标题不得为空',
      [TitleStatus.PreservedError]: `${title} 不能作为标题`,
      [TitleStatus.InvalidFileNameError]: '包含非法字符',
      [TitleStatus.Valid]: '',
    };
    titleStatus.value = messages[editor.checkTitle(title)];
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
