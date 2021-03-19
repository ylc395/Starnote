import { Ref, ref, shallowRef, effect, stop, computed } from '@vue/reactivity';
import { Note } from './Note';
import dayjs from 'dayjs';
import EventEmitter from 'eventemitter3';
import { uniqueId } from 'lodash';

export class Editor extends EventEmitter {
  readonly id = uniqueId();
  readonly title = ref('');
  readonly content = ref('');
  private readonly _isActive = ref(false);
  readonly isActive = computed(() => this._isActive.value);
  private readonly _note: Ref<Note | null> = shallowRef(null);
  readonly note = computed(() => this._note.value);
  private saveRunner?: ReturnType<typeof effect>;
  constructor(note: Note | null = null) {
    super();

    if (note) {
      this.loadNote(note);
    }
  }

  loadNote(note: Note) {
    this._note.value = note;
    this.title.value = note.title.value;

    if (note.content.value) {
      this.content.value = note.content.value;
    }
  }

  saveNote() {
    if (!this._note.value) {
      throw new Error('no note to save!');
    }

    this._note.value.title.value = this.title.value;
    this._note.value.content.value = this.content.value;
    this._note.value.userModifiedAt.value = dayjs();
    this.emit('sync', this._note.value);
  }

  activate() {
    if (!this._note.value) {
      throw new Error('load a note before editor activated!');
    }

    this._isActive.value = true;
    this.saveRunner = effect(this.saveNote.bind(this));
  }

  inactivate() {
    this.removeListener('sync');
    this._isActive.value = false;

    if (this.saveRunner) {
      stop(this.saveRunner);
    }
  }

  destroy(needSave = false) {
    this.inactivate();
    this.removeAllListeners();

    if (!this._note.value) {
      return;
    }

    if (needSave) {
      this.saveNote();
    }

    this._note.value.content.value = null;
    this._note.value = null;
  }

  static isA(instance: unknown): instance is Editor {
    return instance instanceof Editor;
  }
}
