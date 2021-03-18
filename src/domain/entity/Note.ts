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
import { Sortable } from './abstract/Sortable';
import { Optional } from 'utils/types';
import { Exclude } from 'class-transformer';

dayjs.extend(customParseFormat);

export class Note extends Hierarchic<Notebook> implements Sortable {
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

  @Exclude()
  protected readonly parent: Ref<Notebook | null> = shallowRef(null);

  @RefTransform
  readonly sortOrder: Ref<number> = ref(0);

  static from(dataObject: NoteDo, parent?: Notebook) {
    const note = dataObjectToInstance(this, dataObject);

    if (!parent) {
      return note;
    }

    if (parent.id !== note.parentId.value) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    note.setParent(parent);

    return note;
  }
}
export type NoteDo = Optional<Do<Note>, 'content'>;
