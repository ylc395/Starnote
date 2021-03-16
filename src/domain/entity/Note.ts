import dayjs from 'dayjs';
import type { Dayjs } from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ref, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Do, Entity, dataObjectToInstance } from 'domain/entity';
import { TIME_FORMAT } from 'domain/constant';
import { Notebook, ROOT_NOTEBOOK_ID } from './Notebook';
import { Sortable } from './Sortable';
import { Optional } from 'utils/types';
import { Exclude, Transform } from 'class-transformer';

dayjs.extend(customParseFormat);

export class Note extends Entity implements Sortable {
  @Transform(({value}) => ref(value), {toClassOnly: true})
  @Transform(({value}) => value.value, {toPlainOnly: true})
  title: Ref<string> = ref('untitled note');

  @Transform(({value}) => ref(value), {toClassOnly: true})
  @Transform(({value}) => value.value, {toPlainOnly: true})
  readonly content: Ref<string | null> = ref(null);

  @Transform(({value}) => shallowRef(dayjs(value, TIME_FORMAT)), {toClassOnly: true})
  @Transform(({value}) => value.value.format(TIME_FORMAT), {toPlainOnly: true})
  readonly userModifiedAt: Ref<Dayjs> = shallowRef(dayjs());

  @Transform(({value}) => shallowRef(dayjs(value, TIME_FORMAT)), {toClassOnly: true})
  @Transform(({value}) => value.value.format(TIME_FORMAT), {toPlainOnly: true})
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());

  @Transform(({value}) => ref(value), {toClassOnly: true})
  @Transform(({value}) => value.value, {toPlainOnly: true})
  readonly notebookId: Ref<Notebook['id']> = ref(ROOT_NOTEBOOK_ID);

  @Exclude()
  private readonly parent: Ref<Notebook | null> = ref(null);

  @Transform(({value}) => ref(value), {toClassOnly: true})
  @Transform(({value}) => value.value, {toPlainOnly: true})
  readonly sortOrder: Ref<number> = ref(0);

  setParent(notebook: Notebook) {
    this.parent.value = notebook;
    this.notebookId.value = notebook.id;
  }

  static from(dataObject: NoteDo, parent?: Notebook) {
    const note = dataObjectToInstance(this, dataObject);

    if (parent) {
      if (parent.id !== note.notebookId.value) {
        throw new Error('wrong parent, since two ids are not equal');
      }

      note.setParent(parent)
    }

    return note;
  }
}
export type NoteDo = Optional<Do<Note>, 'content'>;
