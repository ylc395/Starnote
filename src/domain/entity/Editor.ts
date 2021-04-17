import { ref, effect, stop } from '@vue/reactivity';
import { Subject } from 'rxjs';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';

import { Note, NoteDataObject } from './Note';
import { Notebook, TitleStatus } from './Notebook';

export class Editor {
  readonly id = uniqueId('editor-');
  private note: Note | null = null;
  get isJustCreated() {
    return this.note?.isJustCreated || false;
  }
  get isIndexNote() {
    return this.note?.isIndexNote || false;
  }
  private content = ref('');
  setContent(content: string) {
    this.content.value = content;
  }
  private readonly loadRunner: ReturnType<typeof effect>;
  private readonly saveRunner: ReturnType<typeof effect>;
  private readonly _save$ = new Subject<{
    snapshot: NoteDataObject;
    note: Note;
  }>();
  get save$() {
    return this._save$.asObservable();
  }
  constructor(note: Note) {
    this.loadRunner = this.loadNote(note);
    this.saveRunner = this.saveNote();
  }
  private readonly title = ref('');
  readonly titleStatus = ref(TitleStatus.Valid);
  get noteTitle() {
    if (!this.note) {
      throw new Error('no note to read title');
    }

    return this.note.title.value;
  }

  setTitle(title: string) {
    const titleStatus = this.checkTitle(title);
    this.titleStatus.value = titleStatus;

    if (titleStatus === TitleStatus.Valid) {
      this.title.value = title;
      this.saveNote();
    }
  }

  resetTitleStatus() {
    this.titleStatus.value = TitleStatus.Valid;
  }

  private checkTitle(title: string) {
    const note = this.note;

    if (!note || !note.parent) {
      throw new Error('no note or parent when check title');
    }

    return note.parent.checkChildTitle(title, note);
  }

  private loadNote(note: Note) {
    this.note = note;

    return effect(() => {
      if (!this.note) {
        return;
      }

      const note = this.note;
      this.note = null;

      const noteContent = note.content.value;
      const noteTitle = note.actualTitle.value;

      if (noteContent === null) {
        throw new Error('empty content');
      }

      this.title.value = noteTitle;
      this.content.value = noteContent;
      this.note = note;
    });
  }

  private saveNote() {
    return effect(() => {
      if (!this.note) {
        return;
      }

      const note = this.note;
      this.note = null;

      const snapshot = note.toDataObject();
      const editorContent = this.content.value;
      const editorTitle = this.title.value;
      let updated = false;

      if (!note.isIndexNote && note.title.value !== editorTitle) {
        note.title.value = this.title.value;
        updated = true;
      }

      if (note.content.value !== editorContent) {
        note.content.value = editorContent;
        updated = true;
      }

      if (updated) {
        note.userModifiedAt.value = dayjs();
        note.isJustCreated = false;
        this._save$.next({ snapshot, note });
      }

      this.note = note;
    });
  }

  contains(item: Note | Notebook) {
    if (!this.note) {
      throw new Error('no note');
    }

    return Note.isA(item)
      ? item.isEqual(this.note)
      : this.note.isDescendenceOf(item);
  }
  destroy() {
    if (!this.note) {
      throw new Error('no note to destroy');
    }

    stop(this.loadRunner);
    stop(this.saveRunner);
    this.note.content.value = null;
    this.note = null;
    this._save$.complete();
  }

  static isA(instance: unknown): instance is Editor {
    return instance instanceof Editor;
  }
}
