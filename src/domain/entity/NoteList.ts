import { computed, shallowReactive } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';
import EventEmitter from 'eventemitter3';
import { pull } from 'lodash';

export class NoteList extends EventEmitter {
  constructor(
    // 只有临时占位凑数的 NoteList 才会没有 notebook
    readonly notebook?: Notebook,
  ) {
    super();
  }
  private readonly _notes: Note[] = shallowReactive([]);
  readonly notes = computed(() => {
    return this._notes.filter(
      (note) => note.id !== this.notebook?.indexNote.value?.id,
    );
  });
  readonly newNoteDisabled = computed(() => {
    return this.notebook?.isRoot ?? true;
  });

  add(note: Note) {
    if (note.parentId.value !== this.notebook?.id) {
      throw new Error("note's parent is wrong");
    }

    if (this._notes.find(note.isEqual.bind(note))) {
      throw new Error(`note(${note.id}) already existed`);
    }

    this._notes.push(note);
  }
  moveTo(noteId: Note['id'], notebook: Notebook) {
    const BIDIRECTIONAL = false; //  todo: 这个变量的值应当由分栏模式决定
    return this.removeNoteById(noteId).setParent(notebook, BIDIRECTIONAL);
  }

  getNoteById(id: Note['id']) {
    const note = this._notes.find((note) => note.id === id);

    if (!note) {
      throw new Error(`no such note(id: ${id})`);
    }

    return note;
  }

  removeNoteById(id: Note['id']) {
    const note = this.getNoteById(id);

    pull(this._notes, note);

    return note;
  }
}
