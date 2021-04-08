import { computed, inject } from 'vue';
import {
  ItemTreeService,
  token as ItemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  SettingService,
  token as settingToken,
} from 'domain/service/SettingService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import { Note, Notebook, SortByEnums } from 'domain/entity';

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
  const {
    setting: { get: getSetting },
  } = inject<SettingService>(settingToken)!;

  const notes = computed(() => {
    if (!Notebook.isA(selectedItem.value)) {
      return [];
    }

    return selectedItem.value.sortedChildren.value?.filter((child) => {
      return Note.isA(child) && !child.isIndexNote;
    });
  });

  const isInvalidNotebook = computed(() => {
    return !Notebook.isA(selectedItem.value) || !selectedItem.value.getParent();
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
    showingFields: computed(() => getSetting('noteListFields')),
  };
}
