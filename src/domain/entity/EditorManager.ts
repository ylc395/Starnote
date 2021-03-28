import {
  shallowReactive,
  ref,
  shallowRef,
  Ref,
  computed,
  shallowReadonly,
} from '@vue/reactivity';
import { isEmpty, isNull, remove, without } from 'lodash';
import { Note, Editor } from 'domain/entity';
import EventEmitter from 'eventemitter3';

const MAX_EDITOR_COUNT = 3;
export const token = Symbol();
export class EditorManager extends EventEmitter {
  private readonly maxEditorCount = ref(MAX_EDITOR_COUNT);
  private readonly _editors: Editor[] = shallowReactive([]);
  readonly editors = computed(() => {
    return shallowReadonly(this._editors);
  });
  private _activeEditor: Ref<Editor | null> = shallowRef(null);
  readonly activeEditor = computed(() => {
    return this._activeEditor.value;
  });
  private getEditorById(id: Editor['id']) {
    const result = this._editors.find((editor) => editor.id === id);

    if (!result) {
      throw new Error(`wrong editor id ${id}`);
    }

    return result;
  }

  setActiveEditor(editor: Editor | Editor['id'] | null, noteToLoad?: Note) {
    if (isNull(editor)) {
      this._activeEditor.value = editor;
      this._editors.forEach((editor) => editor.inactivate());
      return;
    }

    const editorInstance = Editor.isA(editor)
      ? editor
      : this.getEditorById(editor);

    this._activeEditor.value = editorInstance;

    if (noteToLoad) {
      editorInstance.loadNote(noteToLoad);
    }

    without(this._editors, editorInstance).forEach((editor) =>
      editor.inactivate(),
    );

    editorInstance.activate();
  }

  closeEditorById(id: Editor['id']) {
    const byId = (editor: Editor) => editor.id === id;
    const index = this._editors.findIndex(byId);

    if (index < 0) {
      throw new Error('no editor to close!');
    }

    const [removed] = remove(this._editors, byId);

    removed.destroy();

    if (!isEmpty(this._editors)) {
      this.setActiveEditor(this._editors[index] || this._editors[index - 1]);
    } else {
      this.setActiveEditor(null);
    }
  }

  isActive(noteId: Note['id']) {
    return computed(() => {
      return this.activeEditor.value?.note.value?.id === noteId;
    });
  }

  openInEditor(note: Note) {
    const openedEditor = this._editors.find((editor) =>
      note.isEqual(editor.note.value),
    );

    if (openedEditor) {
      this.setActiveEditor(openedEditor, note);
      return;
    }

    const newEditor = new Editor(note);

    this.safeAddEditor(newEditor);
    this.setActiveEditor(newEditor);
  }

  private safeAddEditor(editor: Editor) {
    if (this._editors.length >= this.maxEditorCount.value) {
      const lastEditor = this._editors.shift();
      lastEditor?.destroy();
    }

    this._editors.push(editor);
  }
}
