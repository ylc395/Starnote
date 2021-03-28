import dayjs, { Dayjs } from 'dayjs';
import { NIL } from 'uuid';
import { ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import {
  Do,
  dataObjectToInstance,
  RefTransform,
  DayjsRefTransform,
} from './abstract/Entity';
import { Hierarchic, WithChildren } from './abstract/Hierarchic';
import { Note } from './Note';
import { INDEX_NOTE_TITLE, SortByEnums, SortDirectEnums } from '../constant';
import { ListItem } from './abstract/ListItem';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export const ROOT_NOTEBOOK_ID: Notebook['id'] = NIL;

export class Notebook
  extends Hierarchic<Notebook>
  implements ListItem, WithChildren {
  @RefTransform
  readonly title: Ref<string> = ref('untitled notebook');

  @Exclude()
  protected readonly parent: Ref<Notebook | null> = shallowRef(null);

  @Exclude()
  readonly withContextmenu = ref(false);

  @Exclude()
  children: Ref<(Note | Notebook)[] | null> = shallowRef(null);

  @RefTransform
  readonly parentId: Ref<Notebook['id'] | null> = ref(ROOT_NOTEBOOK_ID);

  @Type(() => Note)
  @Transform(({ value }) => shallowRef(value?.id ? value : null), {
    toClassOnly: true,
  })
  @Transform(({ value }) => value.value, { toPlainOnly: true })
  readonly indexNote: Ref<Note | null> = shallowRef(null);

  @Expose()
  get indexNoteId() {
    return this.indexNote.value?.id ?? null;
  }

  @RefTransform
  readonly sortBy: Ref<SortByEnums> = ref(SortByEnums.Default);

  @RefTransform
  readonly sortDirect: Ref<SortDirectEnums> = ref(SortDirectEnums.Default);

  @RefTransform
  readonly sortOrder: Ref<number> = ref(0);

  @DayjsRefTransform
  readonly userModifiedAt: Ref<Dayjs> = shallowRef(dayjs());

  @DayjsRefTransform
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());

  @Exclude()
  private _noteJustCreated: Note | null = null;

  get noteJustCreated() {
    return this._noteJustCreated;
  }

  set noteJustCreated(val: Note | null) {
    if (val && val?.getParent() !== this) {
      throw new Error('can not set note to open');
    }

    this._noteJustCreated = val;
  }

  get isRoot() {
    return this.id === ROOT_NOTEBOOK_ID;
  }

  hasParent() {
    return super.hasParent() && this.parentId.value !== ROOT_NOTEBOOK_ID;
  }

  createSubNotebook(title: string) {
    const newNotebook = Notebook.from({ parentId: this.id, title }, this);
    newNotebook.children.value = [];

    return newNotebook;
  }

  createNote() {
    const note = Note.createEmptyNote(this, true);
    this.noteJustCreated = note;

    return note;
  }

  createIndexNote() {
    const newNote = Note.createEmptyNote(this, false, {
      title: INDEX_NOTE_TITLE,
    });
    this.indexNote.value = newNote;

    return newNote;
  }

  static isA(instance: unknown): instance is Notebook {
    return instance instanceof Notebook;
  }

  static createRootNotebook() {
    return this.from({
      id: ROOT_NOTEBOOK_ID,
      title: 'ROOT',
      parentId: null,
    });
  }

  static from(dataObject: NotebookDo, parent?: Notebook, bidirectional = true) {
    const notebook = dataObjectToInstance(this, dataObject);

    if (notebook.indexNote.value) {
      notebook.indexNote.value.setParent(notebook, false);
    }

    if (!parent) {
      return notebook;
    }

    if (parent.id !== notebook.parentId.value) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    notebook.setParent(parent, bidirectional);

    return notebook;
  }
}
type NotebookDo = Omit<Do<Notebook>, 'children' | 'parent'>;
