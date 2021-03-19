import {
  shallowReactive,
  ref,
  shallowRef,
  Ref,
  computed,
  shallowReadonly,
} from '@vue/reactivity';
import { remove, without } from 'lodash';
import { Editor } from './Editor';
import type { Note } from './Note';

const MAX_EDITOR_COUNT = 3;
export class EditorManager {
  private readonly maxEditorCount = ref(MAX_EDITOR_COUNT);
  private readonly _editors: Editor[] = shallowReactive([]);
  readonly editors = computed(() => {
    return shallowReadonly(this._editors);
  });
  private _activeEditor: Ref<Editor | null> = shallowRef(null);
  readonly activeEditor = computed(() => {
    return this._activeEditor.value;
  });

  getEditorById(id: Editor['id']) {
    const result = this._editors.find((editor) => editor.id === id);

    if (!result) {
      throw new Error('wrong editor id!');
    }

    return result;
  }

  setActiveEditor(editor: Editor | Editor['id']) {
    const editorInstance = Editor.isA(editor)
      ? editor
      : this.getEditorById(editor);

    this._activeEditor.value = editorInstance;
    editorInstance.activate();
    without(this._editors, editorInstance).forEach((editor) =>
      editor.inactivate(),
    );
  }

  activateEditor() {
    const activeEditor = this._activeEditor.value;

    if (!activeEditor) {
      return;
    }

    activeEditor.activate();
  }

  async openNewEditor(note: Note) {
    if (this._editors.length >= this.maxEditorCount.value) {
      const lastEditor = this._editors.shift();
      lastEditor?.destroy();
    }

    const newEditor = new Editor(note);
    this._editors.push(newEditor);
    this.setActiveEditor(newEditor);
  }

  closeEditorById(id: Editor['id']) {
    const byId = (editor: Editor) => editor.id === id;
    const index = this._editors.findIndex(byId);

    if (index < 0) {
      throw new Error('no editor to close!');
    }

    const [removed] = remove(this._editors, byId);

    removed.destroy();
    this.setActiveEditor(this._editors[index] || this._editors[index - 1]);
  }
}
