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
import { ListItem } from './abstract/ListItem';
import { Expose, Transform, Type } from 'class-transformer';
import { without } from 'lodash';
import { container } from 'tsyringe';
import { Setting } from './Setting';

export const ROOT_NOTEBOOK_ID: Notebook['id'] = NIL;
export const INDEX_NOTE_TITLE = 'INDEX_NOTE';

export enum SortByEnums {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  Title = 'TITLE',
  Custom = 'CUSTOM',
  Default = 'DEFAULT',
}

export enum SortDirectEnums {
  Default = 'DEFAULT',
  Asc = 'ASC',
  Desc = 'DESC',
}

export class Notebook
  extends Hierarchic<Notebook>
  implements ListItem, WithChildren {
  setting = container.resolve(Setting);

  @RefTransform
  readonly title: Ref<string> = ref('untitled notebook');

  @Expose({ name: 'parentId', toPlainOnly: true })
  @Transform(({ value }) => value.value?.id || null, { toPlainOnly: true })
  protected readonly parent: Ref<Notebook | null> = shallowRef(null);

  readonly withContextmenu = ref(false);

  children: Ref<(Note | Notebook)[] | null> = shallowRef(null);

  @Expose({ toClassOnly: true })
  isChildrenLoaded = false;

  sortedChildren = computed(() => {
    if (!this.children.value) {
      return [];
    }

    const copy = this.children.value.slice();
    copy.sort((child1, child2) => {
      const sortBy =
        this.sortBy.value === SortByEnums.Default
          ? this.setting.defaultSortBy
          : this.sortBy.value;

      const sortDirect =
        this.sortDirect.value === SortDirectEnums.Default
          ? this.setting.defaultSortDirect
          : this.sortDirect.value;

      const TOP = sortDirect === SortDirectEnums.Asc ? 1 : -1;
      const BOTTOM = sortDirect === SortDirectEnums.Asc ? -1 : 1;

      switch (sortBy) {
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
          return child1.sortOrder.value > child2.sortOrder.value ? 1 : -1;
        default:
          return 1;
      }
    });

    return copy;
  });

  @Expose({ name: 'indexNoteId', toPlainOnly: true })
  @Type(() => Note)
  @Transform(({ value }) => shallowRef(value?.id ? value : null), {
    toClassOnly: true,
  })
  @Transform(({ value }) => value.value?.id ?? null, { toPlainOnly: true })
  readonly indexNote: Ref<Note | null> = shallowRef(null);

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

  noteJustCreated: Note | null = null;

  get isRoot() {
    return this.id === ROOT_NOTEBOOK_ID;
  }

  createSubNotebook(title: string) {
    const newNotebook = Notebook.from(
      { parentId: this.id, title, isChildrenLoaded: true },
      this,
    );

    return newNotebook;
  }

  createNote() {
    const note = Note.createEmptyNote(this, true);
    this.noteJustCreated = note;
    this.userModifiedAt.value = dayjs();

    return note;
  }

  createIndexNote() {
    const newNote = Note.createEmptyNote(this, false, {
      title: INDEX_NOTE_TITLE,
    });
    this.indexNote.value = newNote;
    this.userModifiedAt.value = dayjs();

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

    if (parent.id !== dataObject.parentId) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    notebook.setParent(parent, true);

    return notebook;
  }
}
export type NotebookDo = Omit<
  Do<Notebook & { parentId: Notebook['id'] }>,
  'children' | 'parent'
>;
