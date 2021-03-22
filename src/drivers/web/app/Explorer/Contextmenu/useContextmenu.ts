import { computed, inject } from 'vue';
import {
  useContextmenu as useCommonContextmenu,
  token,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from '../TreeViewer/ItemTree/NotebookCreator/useNotebookCreator';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import { Notebook } from 'domain/entity';

export function useContextmenu() {
  const notebookCreator = inject(notebookCreatorToken, null);
  const { context } = inject<ReturnType<typeof useCommonContextmenu>>(token)!;
  const { createAndOpenInEditor } = inject<EditorService>(editorToken)!;

  const handleNotebook = (notebook: Notebook, key: string) => {
    switch (key) {
      case 'createNotebook':
        notebookCreator?.startCreating(notebook);
        return;
      case 'createNote':
        createAndOpenInEditor(notebook, false);
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
