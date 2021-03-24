import { Ref, ref, shallowRef, effect, stop, computed } from '@vue/reactivity';
import { Note } from './Note';
import dayjs from 'dayjs';
import EventEmitter from 'eventemitter3';
import { after, uniqueId } from 'lodash';
import { ListItem } from './abstract/ListItem';
import { EntityEvents } from './abstract/Entity';

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
  // only emit after activating
  private readonly emitSync = after(2, () => {
    this.emit(EntityEvents.Sync, this._note.value);
  });
  constructor(note: Note | null = null) {
    super();

    if (note) {
      this.loadNote(note);
    }
  }

  loadNote(note: Note) {
    this._note.value = note;
    this.title.value = note.title.value;
    this.content.value = note.content.value ?? '';
  }

  saveNote() {
    if (!this._note.value) {
      return;
    }

    this._note.value.title.value = this.title.value;
    this._note.value.content.value = this.content.value;
    this._note.value.userModifiedAt.value = dayjs();
    this.emitSync();
  }

  activate() {
    if (!this._note.value) {
      throw new Error('load a note before editor activated!');
    }

    if (this._isActive.value) {
      return;
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

  destroy(needSave = true) {
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
