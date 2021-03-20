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
import { SortByEnums, SortDirectEnums } from '../constant';
import { ListItem } from './abstract/ListItem';
import { Exclude, Expose } from 'class-transformer';

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

  @Expose({ name: 'attachedNoteId' })
  @RefTransform
  readonly noteId: Ref<Note['id'] | null> = ref(null);

  @RefTransform
  readonly sortBy: Ref<SortByEnums> = ref(SortByEnums.Title);

  @RefTransform
  readonly sortDirect: Ref<SortDirectEnums> = ref(SortDirectEnums.Asc);

  @RefTransform
  readonly sortOrder: Ref<number> = ref(0);

  @DayjsRefTransform
  readonly userModifiedAt: Ref<Dayjs> = shallowRef(dayjs());

  @DayjsRefTransform
  readonly userCreatedAt: Ref<Dayjs> = shallowRef(dayjs());
  // readonly orderedChildren = computed(() => {
  //   if (!this.children) {
  //     return [];
  //   }

  //   const copy = this.children.value.slice();
  //   copy.sort((child1, child2) => {
  //     const TOP = this.sortDirect.value === SortDirectEnums.Asc ? 1 : -1;
  //     const BOTTOM = this.sortDirect.value === SortDirectEnums.Asc ? -1 : 1;

  //     switch (this.sortBy.value) {
  //       case SortByEnums.Title:
  //         return child1.title > child2.title ? TOP : BOTTOM;
  //       case SortByEnums.CreatedAt:
  //         return child1.userCreatedAt.value.isAfter(child2.userCreatedAt.value)
  //           ? TOP
  //           : BOTTOM;
  //       case SortByEnums.UpdatedAt:
  //         return child1.userModifiedAt.value.isAfter(
  //           child2.userModifiedAt.value,
  //         )
  //           ? TOP
  //           : BOTTOM;
  //       case SortByEnums.Custom:
  //         return child1.sortOrder.value > child2.sortOrder.value ? TOP : BOTTOM;
  //       default:
  //         return -1;
  //     }
  //   });

  //   return copy;
  // });
  get isRoot() {
    return this.id === ROOT_NOTEBOOK_ID;
  }

  getParent() {
    return this.parent.value;
  }

  hasParent() {
    return super.hasParent() && this.parentId.value !== ROOT_NOTEBOOK_ID;
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

    if (!parent) {
      return notebook;
    }

    if (parent.id !== notebook.parentId.value) {
      throw new Error('wrong parent, since two ids are not equal');
    }

    notebook.setParent(parent);

    return notebook;
  }
}
type NotebookDo = Omit<Do<Notebook>, 'children' | 'parent'>;
