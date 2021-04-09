import { Ref, ref, shallowRef, effect, stop, computed } from '@vue/reactivity';
import { Note } from './Note';
import dayjs from 'dayjs';
import EventEmitter from 'eventemitter3';
import { uniqueId } from 'lodash';
import { ListItem } from './abstract/ListItem';

export enum EditorEvents {
  Sync = 'SYNC',
}

export class Editor extends EventEmitter implements ListItem {
  readonly withContextmenu = ref(false);
  readonly id = uniqueId('editor-');
  readonly title = ref('');
  readonly content = ref('');
  private readonly _isActive = ref(false);
  readonly isActive = computed(() => this._isActive.value);
  private readonly _note: Ref<Note | null> = shallowRef(null);
  readonly note = computed(() => this._note.value);
  private saveRunner?: ReturnType<typeof effect>;
  private saveCount = 0;
  private emitSync() {
    if (!this._note.value) {
      throw new Error('no note to sync');
    }

    if (this.saveCount < 1) {
      this.saveCount++;
      return;
    }

    this._note.value.userModifiedAt.value = dayjs();
    this._note.value.isJustCreated = false;
    this.emit(EditorEvents.Sync, this._note.value);
  }

  constructor(note: Note) {
    super();

    this.loadNote(note);
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

  saveNote() {
    if (!this._note.value) {
      return;
    }

    if (!this._note.value.isIndexNote) {
      this._note.value.title.value = this.title.value;
    }
    this._note.value.content.value = this.content.value;
    this.emitSync();
  }

  activate() {
    if (!this._note.value) {
      throw new Error('load a note before editor activated!');
    }

    if (this._isActive.value) {
      return;
    }

    this.saveCount = 0;
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

  destroy() {
    this.inactivate();
    this.removeAllListeners();

    if (!this._note.value) {
      return;
    }

    this._note.value.content.value = null;
    this._note.value = null;
  }

  static isA(instance: unknown): instance is Editor {
    return instance instanceof Editor;
  }
}
