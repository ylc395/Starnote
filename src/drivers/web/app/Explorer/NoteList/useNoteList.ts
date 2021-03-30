import { computed, inject } from 'vue';
import {
  ItemTreeService,
  token as ItemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import { Note, Notebook } from 'domain/entity';
import { SortByEnums } from 'domain/constant';

export function useNoteList() {
  const {
    itemTree: { selectedItem },
    createNote,
    setSortOrders,
  } = inject<ItemTreeService>(ItemTreeToken)!;
  const {
    openInEditor,
    editorManager: { isActive },
  } = inject<EditorService>(editorToken)!;

  const notes = computed(() => {
    if (!Notebook.isA(selectedItem.value)) {
      return [];
    }

    return selectedItem.value.sortedChildren.value?.filter((child) => {
      return Note.isA(child) && !child.isIndexNote;
    });
  });

  const isInvalidNotebook = computed(() => {
    return !Notebook.isA(selectedItem.value) || selectedItem.value.isRoot;
  });

  const sortable = computed(() => {
    return (
      Notebook.isA(selectedItem.value) &&
      selectedItem.value.sortBy.value === SortByEnums.Custom
    );
  });

  return {
    notes,
    isInvalidNotebook,
    openInEditor,
    isActive,
    createNote,
    setSortOrders,
    sortable,
  };
}
