import dayjs, { Dayjs } from 'dayjs';
import { NIL } from 'uuid';
import { ref, shallowRef } from '@vue/reactivity';
import type { Ref } from "@vue/reactivity";
import { Do, Entity, dataObjectToInstance, RefTransform, DayjsRefTransform } from './Entity';
import { Note } from './Note';
import { SortByEnums, SortDirectEnums, Sortable } from './Sortable';
import { Exclude } from 'class-transformer';

export const ROOT_NOTEBOOK_ID: Notebook['id'] = NIL;

export class Notebook extends Entity implements Sortable {
  @RefTransform
  readonly title: Ref<string> = ref('untitled notebook');

  @Exclude()
  private readonly parent: Ref<Notebook | null> = ref(null);

  @Exclude()
  children: Ref<(Note | Notebook)[] | null> = shallowRef(null);

  @RefTransform
  readonly parentId: Ref<Notebook['id'] | null> = ref(ROOT_NOTEBOOK_ID);

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

  setParent(notebook: Notebook) {
    this.parent.value = notebook;
    this.parentId.value = notebook.id;
  }

  isAncestor(notebook: Notebook): boolean {
    if (notebook.id === ROOT_NOTEBOOK_ID) {
      return false;
    }

    if (!notebook.parent.value) {
      throw new Error('notebook has no parent!');
    }

    if (notebook.parent.value.id === this.id) {
      return true;
    }

    return this.isAncestor(notebook.parent.value);
  }

  isRoot() {
    return this.id === ROOT_NOTEBOOK_ID;
  }

  static createRootNotebook() {
    return this.from({
      id: ROOT_NOTEBOOK_ID,
      title: 'ROOT',
      parentId: null
    });
  }

  static from(dataObject: NotebookDo, parent?: Notebook) {
    const notebook = dataObjectToInstance(this, dataObject);

    if (parent) {
      if (parent.id !== notebook.parentId.value) {
        throw new Error('wrong parent, since two ids are not equal');
      }

      notebook.setParent(parent);
    }

    return notebook;
  }
}
type NotebookDo = Omit<Do<Notebook>, 'children' | 'parent'>;
