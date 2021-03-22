import { computed, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';
import EventEmitter from 'eventemitter3';
import { without } from 'lodash';

export class NoteList extends EventEmitter {
  constructor(readonly notebook?: Notebook) {
    super();
  }
  readonly notes: Ref<Note[]> = shallowRef([]);
  readonly newNoteDisabled = computed(() => {
    return this.notebook?.isRoot ?? true;
  });

  add(note: Note) {
    if (note.parentId.value !== this.notebook?.id) {
      throw new Error("note's parent is wrong");
    }

    if (this.notes.value.find(note.isEqual.bind(note))) {
      throw new Error(`note(${note.id}) already existed`);
    }

    this.notes.value = [...this.notes.value, note];
  }
  moveTo(noteId: Note['id'], notebook: Notebook) {
    return this.removeNoteById(noteId).setParent(notebook, false);
  }

  getNoteById(id: Note['id']) {
    const note = this.notes.value.find((note) => note.id === id);
    if (!note) {
      throw new Error(`no such note(id: ${id})`);
    }

    return note;
  }

  removeNoteById(id: Note['id']) {
    const note = this.getNoteById(id);
    this.notes.value = without(this.notes.value, note);

    return note;
  }
}
