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
  const { createNote, createIndexNote } = inject<ItemTreeService>(
    itemTreeToken,
  )!;

  const handleClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'createNotebook':
        notebookCreator?.startCreating(context.value as Notebook);
        return;
      case 'createNote':
        createNote(context.value as Notebook);
        return;
      case 'createIndexNote':
        createIndexNote(context.value as Notebook);
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
    context,
    handleClick,
  };
}
