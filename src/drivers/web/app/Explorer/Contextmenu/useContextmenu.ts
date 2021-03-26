import { computed, inject } from 'vue';
import {
  useContextmenu as useCommonContextmenu,
  token,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from '../TreeViewer/ItemTree/NotebookCreator/useNotebookCreator';
import { Notebook } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';

export function useContextmenu() {
  const notebookCreator = inject(notebookCreatorToken, null); // 在 NoteList 中时，将得到 null
  const { context } = inject<ReturnType<typeof useCommonContextmenu>>(token)!;
  const { createNote } = inject<ItemTreeService>(itemTreeToken)!;

  const handleClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'createNotebook':
        notebookCreator?.startCreating('notebook', context.value as Notebook);
        return;
      case 'createNote':
        createNote(context.value as Notebook);
        return;
      case 'createIndexNote':
        notebookCreator?.startCreating('indexNote', context.value as Notebook);
        return;
      case 'rename':
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
    handleClick,
  };
}
