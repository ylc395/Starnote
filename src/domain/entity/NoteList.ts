import { computed, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';

export class NoteList {
  constructor(readonly notebook: Notebook) {}
  readonly notes: Ref<Note[]> = shallowRef([]);
  readonly newNoteDisabled = computed(() => {
    return this.notebook.isRoot ?? true;
  });

  add(note: Note) {
    if (note.parentId.value === this.notebook.id) {
      this.notes.value = [...this.notes.value, note];
    }
  }
}
