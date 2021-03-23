import {
  shallowReactive,
  ref,
  shallowRef,
  Ref,
  computed,
  shallowReadonly,
  effect,
} from '@vue/reactivity';
import { container } from 'tsyringe';
import { isEmpty, isNull, remove, without, debounce } from 'lodash';
import { NoteRepository } from 'domain/repository';
import { Note, Editor, Notebook, TreeItem, EntityEvents } from 'domain/entity';
import type { ItemTreeService } from './ItemTreeService';
import { NoteService } from './NoteService';

const noteRepository = container.resolve(NoteRepository);

const MAX_EDITOR_COUNT = 3;
export const token = Symbol();
export class EditorService {
  private readonly maxEditorCount = ref(MAX_EDITOR_COUNT);
  private readonly _editors: Editor[] = shallowReactive([]);
  readonly editors = computed(() => {
    return shallowReadonly(this._editors);
  });
  private _activeEditor: Ref<Editor | null> = shallowRef(null);
  readonly activeEditor = computed(() => {
    return this._activeEditor.value;
  });
  constructor(private readonly itemTreeService: ItemTreeService) {
    this.keepActiveNoteSynced();
  }
  private keepActiveNoteSynced() {
    effect(() => {
      const activeEditor = this.activeEditor.value;

      if (!activeEditor || !activeEditor.note.value) {
        return;
      }

      activeEditor.on(
        EntityEvents.Saved,
        debounce(noteRepository.updateNote.bind(noteRepository), 500),
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

  getNoteById(id: Note['id']) {
    return this._editors.find((editor) => editor.note.value?.id === id)?.note
      .value;
  }

  setActiveEditor(editor: Editor | Editor['id'] | null, noteToLoad?: Note) {
    if (isNull(editor)) {
      this._activeEditor.value = editor;
      return;
    }

    const editorInstance = Editor.isA(editor)
      ? editor
      : this.getEditorById(editor);

    this._activeEditor.value = editorInstance;

    if (noteToLoad) {
      editorInstance.loadNote(noteToLoad);
    }

    editorInstance.activate();
    without(this._editors, editorInstance).forEach((editor) =>
      editor.inactivate(),
    );
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

  async openInEditor(item: TreeItem) {
    if (Notebook.isA(item)) {
      if (item.indexNote.value) {
        this.openIndexNoteInEditor(item.indexNote.value);
      }
      return;
    }

    const note = item;

    if (!note) {
      return;
    }

    const openedEditor = this._editors.find((editor) =>
      note.isEqual(editor.note.value),
    );

    if (openedEditor) {
      this.setActiveEditor(openedEditor, note);
      return;
    }

    if (this._editors.length >= this.maxEditorCount.value) {
      const lastEditor = this._editors.shift();
      lastEditor?.destroy();
    }

    const newEditor = new Editor(note);
    await NoteService.loadContent(note);
    this._editors.push(newEditor);
    this.setActiveEditor(newEditor);
    this.itemTreeService.itemTree.setSelectedItem(note);
  }

  private async openIndexNoteInEditor(note: Note) {
    note;
  }
}
