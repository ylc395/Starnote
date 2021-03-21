import { computed, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';

export class NoteList {
  constructor(readonly notebook?: Notebook) {}
  readonly notes: Ref<Note[]> = shallowRef([]);
  readonly newNoteDisabled = computed(() => {
    return this.notebook?.isRoot ?? true;
  });

  add(note: Note) {
    if (note.parentId.value !== this.notebook?.id) {
      throw new Error("note's parent is wrong");
    }

    this.notes.value = [...this.notes.value, note];
  }

  getNoteById(id: Note['id']) {
    const note = this.notes.value.find((note) => note.id === id);
    if (!note) {
      throw new Error(`no such note(id: ${id})`);
    }

    return note;
  }

  removeNoteById(id: Note['id']) {
    this.notes.value = this.notes.value.filter((note) => note.id !== id);
  }
}
