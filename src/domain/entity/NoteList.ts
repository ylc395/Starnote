import { computed, Ref, shallowRef } from '@vue/reactivity';
import { Note, NoteWithoutParent } from './Note';
import { Notebook } from './Notebook';
import EventEmitter from 'eventemitter3';
import { without } from 'lodash';

export class NoteList extends EventEmitter {
  private _notebook: Ref<Notebook | null> = shallowRef(null);
  get notebook() {
    return this._notebook.value;
  }
  private readonly _notes: Ref<NoteWithoutParent[]> = shallowRef([]);
  readonly notes = computed(() => {
    return this._notes.value.filter((note) => !note.isIndexNote);
  });
  readonly newNoteDisabled = computed(() => {
    return this._notebook.value?.isRoot ?? true;
  });

  load(notebook: Notebook, notes: NoteWithoutParent[]) {
    notes.forEach((note) => {
      if (note.parentId.value !== notebook.id) {
        throw new Error('wrong parent id');
      }
    });

    this._notebook.value = notebook;
    this._notes.value = notes;
  }

  add(note: NoteWithoutParent) {
    if (note.parentId.value !== this._notebook.value?.id) {
      throw new Error("note's parent is wrong");
    }

    if (this._notes.value.find(note.isEqual.bind(note))) {
      throw new Error(`note(${note.id}) already existed`);
    }

    this._notes.value = [...this._notes.value, note];
  }
  moveTo(noteId: Note['id'], notebook: Notebook) {
    const BIDIRECTIONAL = false; //  todo: 这个变量的值应当由分栏模式决定
    return this.removeNoteById(noteId).setParent(notebook, BIDIRECTIONAL);
  }

  getNoteById(id: Note['id']) {
    const note = this._notes.value.find((note) => note.id === id);

    if (!note) {
      throw new Error(`no such note(id: ${id})`);
    }

    return note;
  }

  removeNoteById(id: Note['id']) {
    const note = this.getNoteById(id);

    this._notes.value = without(this._notes.value, note);

    return note;
  }
}
