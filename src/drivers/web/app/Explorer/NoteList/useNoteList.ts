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

export function useNoteList() {
  const {
    itemTree: { historyBack, isEmptyHistory, selectedItem },
    createNote,
  } = inject<ItemTreeService>(ItemTreeToken)!;
  const {
    openInEditor,
    editorManager: { isActive },
  } = inject<EditorService>(editorToken)!;

  const notes = computed(() => {
    if (!Notebook.isA(selectedItem.value)) {
      return [];
    }

    return selectedItem.value.children.value?.filter((child) => {
      return Note.isA(child) && !child.isIndexNote;
    });
  });

  const newNoteDisabled = computed(() => {
    return !Notebook.isA(selectedItem.value) || selectedItem.value.isRoot;
  });

  return {
    notes,
    newNoteDisabled,
    historyBack,
    isEmptyHistory,
    openInEditor,
    isActive,
    createNote,
  };
}
