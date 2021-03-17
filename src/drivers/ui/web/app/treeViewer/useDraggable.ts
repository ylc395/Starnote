import type { TreeDragEvent, DropEvent } from 'ant-design-vue/lib/tree/Tree';
import type {
  TreeItemId,
  TreeItem,
  TreeViewerService,
} from 'domain/service/treeViewer';
import { Notebook } from 'domain/entity';
import { Ref } from 'vue';

export function useDraggable(
  treeViewerService: TreeViewerService,
  dragIcon: Ref<HTMLElement | null>,
) {
  let draggingItemId: null | TreeItemId = null;

  function setParent(childId: TreeItemId, parentId: Notebook['id']) {
    const parent = treeViewerService.itemsKV.getItem(parentId, Notebook);
    const child = treeViewerService.itemsKV.getItem<TreeItem>(childId);

    if (child.parentId.value === parent.id) {
      return;
    }

    child.setParent(parent);
    treeViewerService.emit('itemUpdated', child);
  }

  return {
    handleDragstart: ({ node, event }: TreeDragEvent) => {
      draggingItemId = node.dataRef.key;
      treeViewerService.foldNotebook(draggingItemId!);
      event.dataTransfer!.setDragImage(dragIcon.value!, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },
    handleDragenter: ({ node }: TreeDragEvent) => {
      const id = node.dataRef.key;
      const isNotebook = !node.dataRef.isLeaf;

      if (id !== draggingItemId && isNotebook) {
        treeViewerService.expandNotebook(id);
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
      if (draggingItemId && treeViewerService.root.value?.id) {
        setParent(draggingItemId, treeViewerService.root.value.id);
      }
    },
    handleDragend: () => {
      draggingItemId = null;
    },
  };
}
