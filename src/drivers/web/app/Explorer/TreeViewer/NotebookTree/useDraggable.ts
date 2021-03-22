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
import { partial } from 'lodash';

export function useDraggable() {
  const {
    expandNotebook,
    itemTree: { foldNotebook, moveTo, moveToRoot },
  } = inject<ItemTreeService>(itemTreeToken)!;

  const { moveTo: moveNoteTo } = inject<NoteListService>(noteListToken)!;
  const { noteIconRef, notebookIconRef } = inject(dragIconToken)!;

  // todo: 给 antdV 的 dragenter 事件对象加个 dragNode 成员就能不再使用这个变量了
  let draggingItem: null | TreeItem = null;
  const timerMap = new Map();

  return {
    handleDragstart: ({ node, event: { dataTransfer } }: TreeDragEvent) => {
      draggingItem = node.dataRef.item as TreeItem;
      const isNotebook = !node.dataRef.isLeaf;
      const icon = isNotebook ? notebookIconRef.value! : noteIconRef.value!;

      foldNotebook(draggingItem.id!);
      dataTransfer!.setDragImage(icon, 30, 30);
      dataTransfer!.setData('treeItemId', draggingItem.id);
      dataTransfer!.effectAllowed = 'move';
    },

    handleDragenter: ({ node }: TreeDragEvent) => {
      const { item } = node.dataRef;

      if (!Notebook.isA(item) || item.id === draggingItem?.id) {
        return;
      }

      timerMap.set(item.id, setTimeout(partial(expandNotebook, item), 300));
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

      clearTimeout(timerMap.get(targetNotebook.id));

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

    handleDragleave: ({ node }: TreeDragEvent) => {
      const targetNotebook = node.dataRef.item;

      if (!Notebook.isA(targetNotebook)) {
        return;
      }

      clearTimeout(timerMap.get(targetNotebook.id));
    },

    handleRootDrop: ({ dataTransfer }: DragEvent) => {
      moveToRoot(dataTransfer!.getData('treeItemId'));
    },

    handleDragend: () => {
      draggingItem = null;
    },
  };
}
