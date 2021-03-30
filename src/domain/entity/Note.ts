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
import { Notebook } from './Notebook';
import { ListItem } from './abstract/ListItem';
import { Expose, Transform } from 'class-transformer';

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
  readonly sortOrder: Ref<number> = ref(0);

  readonly withContextmenu = ref(false);

  @Expose({ name: 'parentId', toPlainOnly: true })
  @Transform(({ value }) => value.value.id, { toPlainOnly: true })
  protected readonly parent: Ref<Notebook | null> = shallowRef(null);

  @Expose({ toClassOnly: true })
  isJustCreated = false;

  get isIndexNote() {
    return this.parent.value?.indexNote.value === this;
  }

  getParent() {
    const parent = super.getParent();

    if (!parent) {
      throw new Error('no parent');
    }

    return parent;
  }

  // 和 index note 相关的调用，第三个参数一般是 false
  static from(dataObject: NoteDo, parent?: Notebook, bidirectional = true) {
    const note = dataObjectToInstance(this, dataObject);

    if (!parent) {
      return note;
    }

    if (dataObject.parentId && dataObject.parentId !== parent.id) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    note.setParent(parent, bidirectional);

    return note;
  }

  static isA(entity: unknown): entity is Note {
    return entity instanceof Note;
  }

  static createEmptyNote(
    parent: Notebook,
    bidirectional: boolean,
    note: NoteDo = {},
  ) {
    return Note.from(
      {
        title: 'untitled note',
        content: '',
        ...note,
        isJustCreated: true,
      },
      parent,
      bidirectional,
    );
  }
}

export type NoteDo = Do<Note & { parentId: Notebook['id'] }>;
