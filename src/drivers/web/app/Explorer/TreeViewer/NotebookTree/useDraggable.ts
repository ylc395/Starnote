import { inject } from 'vue';
import type { TreeDragEvent, DropEvent } from 'ant-design-vue/lib/tree/Tree';
import { isTreeItem, Notebook, TreeItem } from 'domain/entity';
import {
  NoteListService,
  token as noteListToken,
} from 'domain/service/NoteListService';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { token as dragIconToken } from '../../DragIcon/useDragIcon';

export function useDraggable() {
  const {
    expandNotebook,
    itemTree: { foldNotebook, moveTo, moveToRoot },
  } = inject<ItemTreeService>(itemTreeToken)!;

  const { moveTo: moveNoteTo } = inject<NoteListService>(noteListToken)!;
  const { noteIconRef, notebookIconRef } = inject(dragIconToken)!;

  // todo: 给 antdV 的 dragenter 事件对象加个 dragNode 成员就能不再使用这个变量了
  let draggingItem: null | TreeItem = null;

  return {
    handleDragstart: ({ node, event }: TreeDragEvent) => {
      draggingItem = node.dataRef.item as TreeItem;
      const isNotebook = !node.dataRef.isLeaf;
      const icon = isNotebook ? notebookIconRef.value! : noteIconRef.value!;

      foldNotebook(draggingItem.id!);
      event.dataTransfer!.setDragImage(icon, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },

    handleDragenter: ({ node }: TreeDragEvent) => {
      const { item } = node.dataRef;

      if (Notebook.isA(item) && item.id !== draggingItem?.id) {
        expandNotebook(item);
      }
    },

    handleDrop: ({ node, dragNode, dropToGap, event }: DropEvent) => {
      if (draggingItem) {
        draggingItem = null;
      }

      const targetNotebook = node.dataRef.item;
      const noteId = event.dataTransfer!.getData('noteId');
      const dragging = dragNode?.dataRef.item;

      if (!Notebook.isA(targetNotebook)) {
        return;
      }

      // 当拖动的不是notebook时， dropToGap 的值不准确
      if (dropToGap && !noteId) {
        return;
      }

      if (noteId) {
        moveNoteTo(noteId, targetNotebook);
        return;
      }

      if (isTreeItem(dragging)) {
        moveTo(dragging, targetNotebook);
      }
    },

    handleRootDrop: () => {
      if (draggingItem) {
        moveToRoot(draggingItem);
      }
    },

    handleDragend: () => {
      draggingItem = null;
    },
  };
}
