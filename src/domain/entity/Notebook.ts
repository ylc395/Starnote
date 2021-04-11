import dayjs, { Dayjs } from 'dayjs';
import { NIL } from 'uuid';
import { computed, ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import {
  dataObjectToInstance,
  instanceToDataObject,
  DataMapper,
  DataMapperStatic,
  RefTransform,
  DayjsRefTransform,
} from './abstract/DataMapper';
import { Hierarchic, WithChildren } from './abstract/Hierarchic';
import { Note, INDEX_NOTE_TITLE } from './Note';
import { ListItem } from './abstract/ListItem';
import { Expose, Transform, Type } from 'class-transformer';
import { without } from 'lodash';
import { container } from 'tsyringe';
import { Setting } from './Setting';
import { staticImplements } from 'utils/types';
import { EntityTypes } from './abstract/Entity';

export const ROOT_NOTEBOOK_ID: Notebook['id'] = NIL;
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

export enum TitleStatus {
  Valid,
  EmptyError,
  DuplicatedError,
  PreservedError,
}

@staticImplements<DataMapperStatic<NotebookDataObject>>()
export class Notebook
  extends Hierarchic<Notebook>
  implements
    ListItem,
    WithChildren<Note | Notebook>,
    DataMapper<NotebookDataObject> {
  setting = container.resolve(Setting);

  @RefTransform
  readonly title: Ref<string> = ref('untitled notebook');

  readonly withContextmenu = ref(false);

  children: Ref<(Note | Notebook)[] | null> = shallowRef(null);

  sortedChildren = computed(() => {
    if (!this.children.value) {
      return [];
    }

    const copy = this.children.value.slice();
    copy.sort((child1, child2) => {
      const sortBy =
        this.sortBy.value === SortByEnums.Default
          ? this.setting.defaultSortBy.value
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

  @Type(() => Note)
  @Expose({ toClassOnly: true })
  @Transform(({ value }) => shallowRef(value?.id ? value : null), {
    toClassOnly: true,
  })
  readonly indexNote: Ref<Note | null> = shallowRef(null);

  @Expose({ toPlainOnly: true })
  get indexNoteId() {
    return this.indexNote.value?.id || null;
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

  noteJustCreated: Note | null = null;

  get isRoot() {
    return this.id === ROOT_NOTEBOOK_ID;
  }

  toDataObject() {
    return instanceToDataObject<this, NotebookDataObject>(this);
  }

  checkChildTitle(
    title: string,
    type: EntityTypes.Note | EntityTypes.Notebook | Notebook | Note,
  ) {
    if (!title) {
      return TitleStatus.EmptyError;
    }

    const checker =
      type === EntityTypes.Note || Note.isA(type) ? Note.isA : Notebook.isA;
    const notePreservedTitle = [INDEX_NOTE_TITLE];

    if (type === EntityTypes.Note && notePreservedTitle.includes(title)) {
      return TitleStatus.PreservedError;
    }

    const duplicated = this.children.value?.find((child) => {
      return (
        !child.isEqual(type) && checker(child) && child.title.value === title
      );
    });

    if (duplicated) {
      return TitleStatus.DuplicatedError;
    }

    return TitleStatus.Valid;
  }

  createSubNotebook(title: string) {
    const titleStatus = this.checkChildTitle(title, EntityTypes.Notebook);

    if (titleStatus !== TitleStatus.Valid) {
      throw new Error('invalid title');
    }

    const newNotebook = Notebook.from({ title }, this);
    return newNotebook;
  }

  getUniqueTitle(baseTitle: string) {
    let title = baseTitle;

    for (
      let i = 1;
      this.checkChildTitle(title, EntityTypes.Note) ===
      TitleStatus.DuplicatedError;
      i++
    ) {
      title = `${baseTitle}-${i}`;
    }

    return title;
  }

  createNote() {
    const note = Note.createNote(this, {
      title: this.getUniqueTitle('untitled note'),
    });
    this.noteJustCreated = note;
    this.userModifiedAt.value = dayjs();

    return note;
  }

  createIndexNote() {
    const newNote = Note.createIndexNote(this);
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

  static from(dataObject: NotebookDataObject, parent?: Notebook) {
    const notebook = dataObjectToInstance(Notebook, dataObject);

    if (notebook.indexNote.value) {
      notebook.indexNote.value.setParent(notebook, false);
    }

    if (!parent) {
      return notebook;
    }

    if (dataObject.parentId && parent.id !== dataObject.parentId) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    notebook.setParent(parent, true);

    return notebook;
  }
}
export interface NotebookDataObject {
  readonly id?: string;
  readonly title?: string;
  readonly parentId?: string;
  readonly sortBy?: SortByEnums;
  readonly sortDirect?: SortDirectEnums;
  readonly sortOrder?: number;
  readonly userModifiedAt?: string;
  readonly userCreatedAt?: string;
  readonly indexNote?: NotebookDataObject | null;
  readonly indexNoteId?: string | null;
}
