import {
  shallowReactive,
  ref,
  shallowRef,
  Ref,
  computed,
  shallowReadonly,
  effect,
} from '@vue/reactivity';
import { isEmpty, remove } from 'lodash';
import { Note, Editor } from 'domain/entity';
import EventEmitter from 'eventemitter3';
import { Notebook } from './Notebook';
import { singleton } from 'tsyringe';
import { EditorEvents } from './Editor';
import { selfish } from 'utils/index';

const MAX_EDITOR_COUNT = 3;

export enum EditorManagerEvents {
  Sync = 'SYNC',
}

@singleton()
export class EditorManager extends EventEmitter<EditorManagerEvents> {
  private readonly maxEditorCount = ref(MAX_EDITOR_COUNT);
  private readonly _editors: Editor[] = shallowReactive([]);
  readonly editors = computed(() => {
    return shallowReadonly(this._editors.map(selfish));
  });
  private _activeEditor: Ref<Editor | null> = shallowRef(null);
  readonly activeEditor = computed(() => {
    return this._activeEditor.value;
  });
  constructor() {
    super();
    effect(() => {
      this._activeEditor.value?.on(EditorEvents.Saved, () =>
        this.emit(
          EditorManagerEvents.Sync,
          this._activeEditor.value?.note.value,
        ),
      );
    });
  }

  private getEditorById(id: Editor['id']) {
    const result = this._editors.find((editor) => editor.id === id);

    if (!result) {
      throw new Error(`wrong editor id ${id}`);
    }

    return result;
  }

  setActiveEditor(editor: Editor | Editor['id'], noteToLoad?: Note) {
    const editorInstance = Editor.isA(editor)
      ? editor
      : this.getEditorById(editor);

    if (noteToLoad) {
      editorInstance.loadNote(noteToLoad);
    }

    this._activeEditor.value = editorInstance;
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
      this._activeEditor.value = null;
    }
  }

  closeEditorOf(item: Note | Notebook) {
    if (Note.isA(item)) {
      const editorToClose = this._editors.find((editor) =>
        editor.note.value?.isEqual(item),
      );

      if (editorToClose) {
        this.closeEditorById(editorToClose.id);
      }
    } else {
      const editors = this._editors.filter((editor) =>
        editor.note.value?.isDescendenceOf(item),
      );
      editors.forEach(({ id }) => this.closeEditorById(id));
    }
  }

  isActive(note: Note) {
    return computed(() => {
      return this.activeEditor.value?.note.value?.isEqual(note);
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
