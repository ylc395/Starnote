import { Ref, ref, shallowRef, effect, stop, computed } from '@vue/reactivity';
import { Subject } from 'rxjs';
import { Note, NoteDataObject } from './Note';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import { ListItem } from './abstract/ListItem';
import { TitleStatus } from './Notebook';

export class Editor implements ListItem {
  readonly withContextmenu = ref(false);
  readonly id = uniqueId('editor-');
  private readonly _title = ref('');
  get title() {
    return computed(() => this._title.value);
  }
  readonly content = ref('');
  private readonly _note: Ref<Note | null> = shallowRef(null);
  get note() {
    return computed(() => this._note.value);
  }
  get isJustCreated() {
    return this._note.value?.isJustCreated || false;
  }
  private saveEffect: ReturnType<typeof effect> | null = null;
  private readonly _save$ = new Subject<{
    snapshot: NoteDataObject;
    note: Note;
  }>();

  get save$() {
    return this._save$.asObservable();
  }
  constructor(note: Note) {
    this.loadNote(note);
    this.autoSave();
  }

  setTitle(title: string) {
    if (!this._note.value) {
      throw new Error('no note when set title');
    }

    const titleStatus = this.checkTitle(title);

    if (titleStatus === TitleStatus.Valid) {
      this._title.value = title;
    } else {
      throw new Error('invalid title in editor');
    }
  }

  checkTitle(title: string) {
    const note = this._note.value;

    if (!note || !note.parent) {
      throw new Error('no note or parent when check title');
    }

    return note.parent.checkChildTitle(title, note);
  }

  autoSave() {
    if (!this._note.value) {
      throw new Error('load note before enable auto save');
    }

    if (!this.saveEffect) {
      this.loadNote(this._note.value);
      this.saveEffect = effect(this.saveNote.bind(this));
    }
  }

  stopAutoSave() {
    if (this.saveEffect) {
      stop(this.saveEffect);
      this.saveEffect = null;
    }
  }

  loadNote(note: Note) {
    this._note.value = note;

    const content = note.content.value;
    const title = note.actualTitle.value;

    if (content === null) {
      throw new Error('empty title/content');
    }

    if (this._title.value !== title) {
      this._title.value = title;
    }

    if (this.content.value !== content) {
      this.content.value = content;
    }
  }

  private saveNote() {
    if (!this._note.value) {
      throw new Error('no note to save');
    }

    const { title: noteTitle, content: noteContent } = this._note.value;

    const snapshot = this._note.value.toDataObject();

    let updated = false;

    if (
      !this._note.value.isIndexNote &&
      noteTitle.value !== this._title.value
    ) {
      noteTitle.value = this._title.value;
      updated = true;
    }

    if (noteContent.value !== this.content.value) {
      noteContent.value = this.content.value;
      updated = true;
    }

    if (updated) {
      this._note.value.userModifiedAt.value = dayjs();
      this._note.value.isJustCreated = false;
      this._save$.next({ snapshot, note: this._note.value });
    }
  }

  destroy() {
    if (!this._note.value) {
      throw new Error('no note to destroy');
    }

    this._note.value.content.value = null;
    this._note.value = null;
    this.stopAutoSave();
    this._save$.complete();
  }

  static isA(instance: unknown): instance is Editor {
    return instance instanceof Editor;
  }
}
