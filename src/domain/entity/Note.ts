import dayjs from 'dayjs';
import type { Dayjs } from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Ref, ref } from '@vue/runtime-core';
import { Do, Entity } from 'domain/entity';
import { TIME_FORMAT } from 'domain/constant';
import { Notebook, ROOT_NOTEBOOK_ID } from './Notebook';
import { Sortable } from './Sortable';
import { Optional } from 'utils/types';

dayjs.extend(customParseFormat);

export class Note extends Entity implements Sortable {
  readonly title: Ref<string>;
  readonly content: Ref<string | null>;
  readonly userModifiedAt: Ref<Dayjs>;
  readonly userCreatedAt: Ref<Dayjs>;
  readonly notebookId: Ref<Notebook['id']>;
  readonly sortOrder: Ref<number>;
  constructor(noteDo: NoteDo = {}) {
    super(noteDo || { id: '' });

    this.title = ref(noteDo.title || 'untitled note');
    this.userCreatedAt = ref(dayjs(noteDo.userCreatedAt, TIME_FORMAT));
    this.userModifiedAt = ref(dayjs(noteDo.userModifiedAt, TIME_FORMAT));
    this.notebookId = ref(noteDo.notebookId || ROOT_NOTEBOOK_ID);
    this.sortOrder = ref(noteDo.sortOrder || 0);

    this.content = ref(
      typeof noteDo.content === 'string' ? noteDo.content : null,
    );
  }
}
export type NoteDo = Optional<Do<Note>, 'content'>;
