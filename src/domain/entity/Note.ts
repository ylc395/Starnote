import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import {
  Do,
  dataObjectToInstance,
  RefTransform,
  DayjsRefTransform,
} from 'domain/entity';
import { Hierarchic } from './abstract/Hierarchic';
import { Notebook, ROOT_NOTEBOOK_ID } from './Notebook';
import { ListItem } from './abstract/ListItem';
import { Exclude } from 'class-transformer';

dayjs.extend(customParseFormat);

export class Note extends Hierarchic<Notebook> implements ListItem {
  @RefTransform
  title: Ref<string> = ref('untitled note');

  @RefTransform
  readonly content: Ref<string | null> = ref(null);

  @DayjsRefTransform
  readonly userModifiedAt: Ref<Dayjs> = shallowRef(dayjs());

  @DayjsRefTransform
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());

  @RefTransform
  readonly parentId: Ref<Notebook['id']> = ref(ROOT_NOTEBOOK_ID);

  @RefTransform
  readonly sortOrder: Ref<number> = ref(0);

  @Exclude()
  readonly withContextmenu = ref(false);

  @Exclude()
  protected readonly parent: Ref<Notebook | null> = shallowRef(null);

  get isIndexNote() {
    return this.parent.value?.indexNote.value === this;
  }

  static from(dataObject: NoteDo, parent?: Notebook) {
    const note = dataObjectToInstance(this, dataObject);

    if (!parent) {
      return note;
    }

    if (dataObject.parentId && dataObject.parentId !== parent.id) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    note.setParent(parent);

    return note;
  }

  static createEmptyNote(
    parent: Notebook,
    parentSynced: boolean,
    note: NoteDo = {},
  ) {
    return Note.from(
      {
        title: 'untitled note',
        content: '',
        ...note,
        ...(parentSynced ? null : { parentId: parent.id }),
      },
      parentSynced ? parent : undefined,
    );
  }
}

export type NoteDo = Do<Note>;
