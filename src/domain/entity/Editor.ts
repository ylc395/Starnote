import { Ref, ref, shallowRef, effect, stop, computed } from '@vue/reactivity';
import { Note } from './Note';
import dayjs from 'dayjs';
import EventEmitter from 'eventemitter3';
import { uniqueId } from 'lodash';
import { ListItem } from './abstract/ListItem';

export enum EditorEvents {
  Saved = 'SAVED',
}

export class Editor extends EventEmitter<EditorEvents> implements ListItem {
  readonly withContextmenu = ref(false);
  readonly id = uniqueId('editor-');
  readonly title = ref('');
  readonly content = ref('');
  private readonly _note: Ref<Note | null> = shallowRef(null);
  readonly note = computed(() => this._note.value);
  private saveEffect: ReturnType<typeof effect>;

  constructor(note: Note) {
    super();
    this.loadNote(note);
    this.saveEffect = effect(this.saveNote.bind(this));
  }

  loadNote(note: Note) {
    this._note.value = note;

    const content = note.content.value;
    const title = note.isIndexNote ? note.parent.title.value : note.title.value;

    if (content === null) {
      throw new Error('empty title/content');
    }

    this.title.value = title;
    this.content.value = content;
  }

  private saveNote() {
    if (!this._note.value) {
      throw new Error('no note to save');
    }

    const { title: noteTitle, content: noteContent } = this._note.value;
    let updated = false;

    if (!this._note.value.isIndexNote && noteTitle.value !== this.title.value) {
      noteTitle.value = this.title.value;
      updated = true;
    }

    if (noteContent.value !== this.content.value) {
      noteContent.value = this.content.value;
      updated = true;
    }

    if (updated) {
      this._note.value.userModifiedAt.value = dayjs();
      this._note.value.isJustCreated = false;
      this.emit(EditorEvents.Saved);
    }
  }

  destroy() {
    if (!this._note.value) {
      throw new Error('no note to destroy');
    }

    this._note.value.content.value = null;
    this._note.value = null;
    this.removeAllListeners();
    stop(this.saveEffect);
  }

  static isA(instance: unknown): instance is Editor {
    return instance instanceof Editor;
  }
}
