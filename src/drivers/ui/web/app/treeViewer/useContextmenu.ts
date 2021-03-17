import { InjectionKey } from '@vue/runtime-core';
import { TreeViewerService } from 'domain/service/TreeViewerService';
import { ContextmenuService } from 'drivers/ui/web/components/Contextmenu/useContextmenu';
import { useNotebookCreate } from './useNotebookCreate';

export function useContextmenu(
  treeService: TreeViewerService,
  notebookCreatingService: ReturnType<typeof useNotebookCreate>,
) {
  const service = new ContextmenuService();

  return {
    openContextmenu({
      event,
      node,
    }: {
      event: MouseEvent;
      node: Record<string, never>;
    }) {
      service.open({ x: event.clientX, y: event.clientY });
      treeService.setSelectedItem(node.eventKey);
    },

    createNotebook() {
      notebookCreatingService.startCreating(false);
    },
  };
}

export const token: InjectionKey<ReturnType<typeof useContextmenu>> = Symbol();
