import type { TreeDragEvent, DropEvent } from 'ant-design-vue/lib/tree/Tree';
import {
  TreeItemId,
  NotebookTreeService,
  token,
} from 'domain/service/NotebookTreeService';
import { Ref, inject } from 'vue';

interface Icons {
  notebookIconRef: Ref<HTMLElement | null>;
  noteIconRef: Ref<HTMLElement | null>;
}

export function useDraggable({ notebookIconRef, noteIconRef }: Icons) {
  const notebookTreeService = inject<NotebookTreeService>(token)!;
  let draggingItemId: null | TreeItemId = null;

  return {
    handleDragstart: ({ node, event }: TreeDragEvent) => {
      draggingItemId = node.dataRef.key;
      const isNotebook = !node.dataRef.isLeaf;
      const icon = isNotebook ? notebookIconRef.value! : noteIconRef.value!;

      notebookTreeService.foldNotebook(draggingItemId!);
      event.dataTransfer!.setDragImage(icon, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },
    handleDragenter: ({ node }: TreeDragEvent) => {
      const id = node.dataRef.key;
      const isNotebook = !node.dataRef.isLeaf;

      if (id !== draggingItemId && isNotebook) {
        notebookTreeService.expandNotebook(id);
      }
    },
    handleDrop: ({ node, dragNode, dropToGap }: DropEvent) => {
      if (node.dataRef.isLeaf) {
        return;
      }

      if (dropToGap) {
        return;
      }

      notebookTreeService.setParent(dragNode.eventKey, node.eventKey);
    },
    handleRootDrop: () => {
      if (draggingItemId && notebookTreeService.root.value?.id) {
        notebookTreeService.setParent(
          draggingItemId,
          notebookTreeService.root.value.id,
        );
      }
    },
    handleDragend: () => {
      draggingItemId = null;
    },
  };
}
