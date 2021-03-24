import { computed, inject } from 'vue';
import {
  useContextmenu as useCommonContextmenu,
  token,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from '../TreeViewer/ItemTree/NotebookCreator/useNotebookCreator';
import { Notebook } from 'domain/entity';
import {
  NoteListService,
  token as noteListToken,
} from 'domain/service/NoteListService';

export function useContextmenu() {
  const notebookCreator = inject(notebookCreatorToken, null);
  const { context } = inject<ReturnType<typeof useCommonContextmenu>>(token)!;
  const { createNoteAndOpenInEditor } = inject<NoteListService>(noteListToken)!;

  const handleNotebook = (notebook: Notebook, key: string) => {
    switch (key) {
      case 'createNotebook':
        notebookCreator?.startCreating(notebook);
        return;
      case 'createNote':
        createNoteAndOpenInEditor(notebook, false);
        return;
      case 'createIndexNote':
        notebookCreator?.startCreating(notebook, 'indexNote');
        return;
      default:
        break;
    }
  };

  return {
    type: computed(() => {
      if (Notebook.isA(context.value)) {
        return 'notebook';
      }

      return 'note';
    }),
    handleClick({ key }: { key: string }) {
      if (Notebook.isA(context.value)) {
        handleNotebook(context.value, key);
      }
    },
  };
}
