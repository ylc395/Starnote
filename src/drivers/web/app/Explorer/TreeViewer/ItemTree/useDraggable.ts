import { inject } from 'vue';
import type { TreeDragEvent, DropEvent } from 'ant-design-vue/lib/tree/Tree';
import { Notebook, TreeItem } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { token as dragIconToken } from '../../DragIcon/useDragIcon';
import { partial } from 'lodash';

const EXPAND_WAIT_TIME = 500;

export function useDraggable() {
  const {
    itemTree: { foldNotebook, moveTo, expandNotebook, movingItem, root },
  } = inject<ItemTreeService>(itemTreeToken)!;
  const { noteIconRef, notebookIconRef } = inject(dragIconToken)!;
  const timerMap = new Map();

  return {
    handleDragstart: ({ node, event: { dataTransfer } }: TreeDragEvent) => {
      movingItem.value = node.dataRef.item as TreeItem;
      const isNotebook = !node.dataRef.isLeaf;
      const icon = isNotebook ? notebookIconRef.value! : noteIconRef.value!;

      if (Notebook.isA(movingItem.value)) {
        foldNotebook(movingItem.value);
      }

      dataTransfer!.setDragImage(icon, 30, 30);
      dataTransfer!.effectAllowed = 'move';
    },

    handleDragenter: ({ node }: TreeDragEvent) => {
      const { item } = node.dataRef;

      if (!Notebook.isA(item) || item.id === movingItem.value?.id) {
        return;
      }

      timerMap.set(
        item.id,
        setTimeout(partial(expandNotebook, item), EXPAND_WAIT_TIME),
      );
    },

    handleDrop: ({ node }: DropEvent) => {
      const targetNotebook = node.dataRef.item;

      if (!Notebook.isA(targetNotebook)) {
        return;
      }

      // antd-vue 的 Tree 组件是先触发 drop 才触发 dragenter 时间的
      // 因此这里需要一个延时
      setTimeout(() => {
        clearTimeout(timerMap.get(targetNotebook.id));
        // 400 这个数字来自
        // https://github.com/vueComponent/ant-design-vue/blob/e30077dd8334c5aaf2c094a46401f10e6f662ad9/components/vc-tree/src/Tree.jsx#L321
      }, 400);

      moveTo(targetNotebook);
    },

    handleDragleave: ({ node }: TreeDragEvent) => {
      const targetNotebook = node.dataRef.item;

      if (!Notebook.isA(targetNotebook)) {
        return;
      }

      clearTimeout(timerMap.get(targetNotebook.id));
    },
    handleRootDrop() {
      moveTo(root.value!);
    },
    handleDragend: () => {
      movingItem.value = null;
    },
  };
}
