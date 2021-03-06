import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { computed, ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import {
  dataObjectToInstance,
  DataMapper,
  RefTransform,
  DayjsRefTransform,
  instanceToDataObject,
  DataMapperStatic,
} from './abstract/DataMapper';
import { Hierarchic } from './abstract/Hierarchic';
import { EntityTypes } from './abstract/Entity';
import type { ListItem } from './abstract/ListItem';
import type { GitItem, GitStatusMark } from './abstract/GitItem';
import { Notebook, TitleStatus } from './Notebook';
import { staticImplements } from 'utils/types';

export const EMPTY_TITLE = '(empty title)';
export const INDEX_NOTE_TITLE = 'INDEX_NOTE';
export const NOTE_SUFFIX = '.md';

@staticImplements<DataMapperStatic<NoteDataObject>>()
export class Note
  extends Hierarchic<Notebook>
  implements GitItem, ListItem, DataMapper<NoteDataObject> {
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
  readonly gitStatus: GitItem['gitStatus'] = ref({
    mode: 'none' as GitStatusMark,
    from: null,
  });

  isJustCreated = false;

  get isIndexNote() {
    return this.parent?.indexNote.value === this;
  }

  get actualTitle() {
    return computed(() =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.isIndexNote ? this.parent!.title.value : this.title.value,
    );
  }

  getPath(suffix = true) {
    return `${super.getPath()}${suffix ? NOTE_SUFFIX : ''}`;
  }

  toDataObject() {
    return instanceToDataObject<this, NoteDataObject>(this);
  }

  // 和 index note 相关的调用，第三个参数一般是 false
  static from(
    dataObject: NoteDataObject,
    parent?: Notebook,
    bidirectional = true,
  ) {
    const note = dataObjectToInstance(Note, dataObject);

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

  static createNote(parent: Notebook, note: NoteDataObject) {
    if (
      !note.title ||
      parent.checkChildTitle(note.title, EntityTypes.Note) !== TitleStatus.Valid
    ) {
      throw new Error(`invalid note title`);
    }

    const newNote = Note.from({ content: '', ...note }, parent, true);

    newNote.isJustCreated = true;
    return newNote;
  }

  static createIndexNote(parent: Notebook) {
    const newNote = Note.from(
      { content: '', title: INDEX_NOTE_TITLE },
      parent,
      false,
    );
    newNote.isJustCreated = true;

    return newNote;
  }
}

export interface NoteDataObject {
  readonly id?: string;
  readonly title?: string;
  readonly content?: string;
  readonly userModifiedAt?: string;
  readonly userCreatedAt?: string;
  readonly parentId?: string;
  readonly sortOrder?: number;
}
