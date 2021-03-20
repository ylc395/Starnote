import { inject } from 'vue';
import type { TreeDragEvent, DropEvent } from 'ant-design-vue/lib/tree/Tree';
import type { TreeItemId } from 'domain/entity';
import { ItemTreeService, token } from 'domain/service/ItemTreeService';
import { token as dragIconToken } from '../../DragIcon/useDragIcon';

export function useDraggable() {
  const {
    expandNotebook,
    itemTree: { foldNotebook, setParent, setRootAsParent },
  } = inject<ItemTreeService>(token)!;
  const { noteIconRef, notebookIconRef } = inject(dragIconToken)!;

  let draggingItemId: null | TreeItemId = null;

  return {
    handleDragstart: ({ node, event }: TreeDragEvent) => {
      draggingItemId = node.dataRef.key;
      const isNotebook = !node.dataRef.isLeaf;
      const icon = isNotebook ? notebookIconRef.value! : noteIconRef.value!;

      foldNotebook(draggingItemId!);
      event.dataTransfer!.setDragImage(icon, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },
    handleDragenter: ({ node }: TreeDragEvent) => {
      const id = node.dataRef.key;
      const isNotebook = !node.dataRef.isLeaf;

      if (id !== draggingItemId && isNotebook) {
        expandNotebook(id);
      }
    },
    handleDrop: ({ node, dragNode, dropToGap }: DropEvent) => {
      if (node.dataRef.isLeaf) {
        return;
      }

      if (dropToGap) {
        return;
      }

      setParent(dragNode.eventKey, node.eventKey);
    },
    handleRootDrop: () => {
      if (draggingItemId) {
        setRootAsParent(draggingItemId);
      }
    },
    handleDragend: () => {
      draggingItemId = null;
    },
  };
}
