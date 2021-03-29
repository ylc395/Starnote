import dayjs, { Dayjs } from 'dayjs';
import { NIL } from 'uuid';
import { computed, ref, shallowRef } from '@vue/reactivity';
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
import { without } from 'lodash';

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

  @Exclude()
  isChildrenLoaded = false;

  @Exclude()
  sortedChildren = computed(() => {
    if (!this.children.value) {
      return [];
    }

    const copy = this.children.value.slice();
    copy.sort((child1, child2) => {
      const TOP = this.sortDirect.value === SortDirectEnums.Asc ? 1 : -1;
      const BOTTOM = this.sortDirect.value === SortDirectEnums.Asc ? -1 : 1;

      switch (this.sortBy.value) {
        case SortByEnums.Title:
          return child1.title.value > child2.title.value ? TOP : BOTTOM;
        case SortByEnums.CreatedAt:
          return child1.userCreatedAt.value.isAfter(child2.userCreatedAt.value)
            ? TOP
            : BOTTOM;
        case SortByEnums.UpdatedAt:
          return child1.userModifiedAt.value.isAfter(
            child2.userModifiedAt.value,
          )
            ? TOP
            : BOTTOM;
        case SortByEnums.Custom:
          return child1.sortOrder.value > child2.sortOrder.value ? TOP : BOTTOM;
        default:
          return 1;
      }
    });

    return copy;
  });

  @RefTransform
  readonly parentId: Ref<Notebook['id'] | null> = ref(ROOT_NOTEBOOK_ID);

  @Exclude({ toPlainOnly: true })
  @Type(() => Note)
  @Transform(({ value }) => shallowRef(value?.id ? value : null), {
    toClassOnly: true,
  })
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

  removeChild(child: Note | Notebook) {
    if (!this.children.value) {
      throw new Error('no children to remove');
    }
    const newChildren = without(this.children.value, child);

    if (newChildren.length === this.children.value.length) {
      throw new Error('no such child to remove');
    }

    this.children.value = newChildren;
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

  static from(dataObject: NotebookDo, parent?: Notebook) {
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

    notebook.setParent(parent, true);

    return notebook;
  }
}
type NotebookDo = Omit<Do<Notebook>, 'children' | 'parent'>;
