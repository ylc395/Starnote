import { ref, effect, stop, computed } from '@vue/reactivity';
import { Subject } from 'rxjs';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';

import { Note, NoteDataObject } from './Note';
import { Notebook, TitleStatus } from './Notebook';

export class Editor {
  constructor(note: Note) {
    this.loadRunner = this.loadNote(note);
    this.saveRunner = this.startAutoSave();
  }
  readonly id = uniqueId('editor-');
  private note: Note | null = null;
  private isSaving = false;
  get isJustCreated() {
    return this.note?.isJustCreated || false;
  }
  get isIndexNote() {
    return this.note?.isIndexNote || false;
  }
  private _content = ref('');
  content = computed(() => this._content.value);
  private readonly loadRunner: ReturnType<typeof effect>;
  private readonly saveRunner: ReturnType<typeof effect>;
  private readonly _save$ = new Subject<{
    snapshot: NoteDataObject;
    note: Note;
  }>();
  save$ = this._save$.asObservable();
  private readonly title = ref('');
  noteTitle = computed(() => {
    if (!this.note) {
      throw new Error('no note when read title');
    }
    return this.note.title.value;
  });
  readonly titleStatus = ref(TitleStatus.Valid);

  private checkTitle(title: string) {
    const note = this.note;

    if (!note || !note.parent) {
      throw new Error('no note or parent when check title');
    }

    return note.parent.checkChildTitle(title, note);
  }

  setTitle(title: string) {
    const titleStatus = this.checkTitle(title);
    this.titleStatus.value = titleStatus;

    if (titleStatus === TitleStatus.Valid) {
      this.title.value = title;
    }
  }

  resetTitle() {
    this.titleStatus.value = TitleStatus.Valid;
    this.title.value = this.noteTitle.value;
  }

  setContent(content: string) {
    this._content.value = content;
  }

  private loadNote(note: Note) {
    this.note = note;

    return effect(() => {
      if (this.isSaving) {
        this.isSaving = true;
        return;
      }

      const noteContent = note.content.value;
      const noteTitle = note.actualTitle.value;

      if (noteContent === null) {
        throw new Error('empty content');
      }

      this.title.value = noteTitle;
      this._content.value = noteContent;
    });
  }

  private saveNote() {
    if (!this.note) {
      throw new Error('no note to save');
    }

    this.isSaving = true;

    const note = this.note;
    const snapshot = note.toDataObject();

    note.title.value = this.title.value;
    note.content.value = this._content.value;
    note.userModifiedAt.value = dayjs();
    note.isJustCreated = false;
    this._save$.next({ snapshot, note });
    this.isSaving = false;
  }

  private startAutoSave() {
    return effect(() => {
      const note = this.note;
      const editorContent = this._content.value;
      const editorTitle = this.title.value;

      if (!note) {
        throw new Error('no note to save');
      }

      const titleUpdated =
        !note.isIndexNote && note.title.value !== editorTitle;
      const contentUpdated = note.content.value !== editorContent;

      if (titleUpdated || contentUpdated) {
        this.saveNote();
      }
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
