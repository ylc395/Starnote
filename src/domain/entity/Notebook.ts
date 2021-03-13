import dayjs, { Dayjs } from 'dayjs';
import { NIL } from 'uuid';
import { ref, Ref, shallowRef } from '@vue/reactivity';
import { Do, Entity } from './Entity';
import { Note } from './Note';
import { TIME_FORMAT } from 'domain/constant';
import { SortByEnums, SortDirectEnums, Sortable } from './Sortable';

export const ROOT_NOTEBOOK_ID: Notebook['id'] = NIL;

export class Notebook extends Entity implements Sortable {
  readonly title: Ref<string>;
  readonly parentId: Ref<Notebook['id'] | null>;
  readonly noteId: Ref<Note['id'] | null>;
  readonly sortBy: Ref<SortByEnums>;
  readonly sortDirect: Ref<SortDirectEnums>;
  readonly sortOrder: Ref<number>;
  readonly userModifiedAt: Ref<Dayjs>;
  readonly userCreatedAt: Ref<Dayjs>;
  children: Ref<(Note | Notebook)[] | null> = shallowRef(null);
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
  constructor(noteBookDo: NoteBookDo = {}) {
    super(noteBookDo || { id: '' });

    this.title = ref(noteBookDo.title || 'untitled notebook');
    this.parentId = ref(
      noteBookDo.parentId === null
        ? null
        : noteBookDo.parentId || ROOT_NOTEBOOK_ID,
    );
    this.noteId = ref(noteBookDo.noteId || null);
    this.sortBy = ref(noteBookDo.sortBy || SortByEnums.Title);

    this.userCreatedAt = shallowRef(
      noteBookDo.userCreatedAt
        ? dayjs(noteBookDo.userCreatedAt, TIME_FORMAT)
        : dayjs(),
    );
    this.userModifiedAt = shallowRef(
      noteBookDo.userModifiedAt
        ? dayjs(noteBookDo.userModifiedAt, TIME_FORMAT)
        : dayjs(),
    );
    this.sortOrder = ref(noteBookDo.sortOrder || 0);
    this.sortDirect = ref(noteBookDo.sortDirect || SortDirectEnums.Asc);
  }

  static createRootNotebook() {
    return new Notebook({
      id: ROOT_NOTEBOOK_ID,
      parentId: null,
      title: 'ROOT',
    });
  }
}
type NoteBookDo = Omit<Do<Notebook>, 'children'>;
