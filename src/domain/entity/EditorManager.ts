import {
  shallowReactive,
  ref,
  shallowRef,
  Ref,
  computed,
  shallowReadonly,
} from '@vue/reactivity';
import { isEmpty, remove } from 'lodash';
import { Subject } from 'rxjs';
import { Note, Editor } from 'domain/entity';
import { Notebook } from './Notebook';
import { singleton } from 'tsyringe';
import { selfish } from 'utils/index';
import { NoteDataObject } from './Note';

const MAX_EDITOR_COUNT = 3;

export enum EditorManagerEvents {
  Sync = 'SYNC',
  Activated = 'ACTIVATED',
}

@singleton()
export class EditorManager {
  private readonly maxEditorCount = ref(MAX_EDITOR_COUNT);
  private readonly _editors: Editor[] = shallowReactive([]);
  get editors() {
    return computed(() => {
      return shallowReadonly(this._editors.map(selfish));
    });
  }

  private _activeEditor: Ref<Editor | null> = shallowRef(null);
  get activeEditor() {
    return computed(() => {
      return this._activeEditor.value;
    });
  }

  private readonly _event$ = new Subject<{
    event: EditorManagerEvents;
    snapshot?: NoteDataObject;
    note?: Note;
    editor?: Editor;
  }>();

  get event$() {
    return this._event$.asObservable();
  }

  private getEditorById(id: Editor['id']) {
    const result = this._editors.find((editor) => editor.id === id);

    if (!result) {
      throw new Error(`wrong editor id ${id}`);
    }

    return result;
  }

  setActiveEditor(editor: Editor | Editor['id']) {
    const editorInstance = Editor.isA(editor)
      ? editor
      : this.getEditorById(editor);

    this._activeEditor.value = editorInstance;
    this._event$.next({
      event: EditorManagerEvents.Activated,
      editor: editorInstance,
    });
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
        editor.contains(item),
      );

      if (editorToClose) {
        this.closeEditorById(editorToClose.id);
      }
    } else {
      const editors = this._editors.filter((editor) => editor.contains(item));
      editors.forEach(({ id }) => this.closeEditorById(id));
    }
  }

  isActive(note: Note) {
    return computed(() => {
      return this._activeEditor.value?.contains(note);
    });
  }

  openInEditor(note: Note) {
    const openedEditor = this._editors.find((editor) => editor.contains(note));

    if (openedEditor) {
      this.setActiveEditor(openedEditor);
      return;
    }

    const newEditor = new Editor(note);
    if (this._editors.length >= this.maxEditorCount.value) {
      const lastEditor = this._editors.shift();
      lastEditor?.destroy();
    }

    this._editors.push(newEditor);
    this.setActiveEditor(newEditor);

    newEditor.save$.subscribe(({ note, snapshot }) => {
      this._event$.next({ event: EditorManagerEvents.Sync, snapshot, note });
    });
  }
}
