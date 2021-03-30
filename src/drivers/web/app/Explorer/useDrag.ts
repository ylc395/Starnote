import { Notebook, TreeItem } from 'domain/entity';
import { inject, InjectionKey, provide } from 'vue';
import { useDragIcon } from './DragIcon/useDragIcon';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { TreeDragEvent } from 'ant-design-vue/lib/tree/Tree';
import { partial } from 'lodash';

const EXPAND_WAIT_TIME = 500;

export const token: InjectionKey<ReturnType<typeof useDrag>> = Symbol();

export function useDrag() {
  const {
    itemTree: { foldNotebook, expandNotebook, root },
    moveTo,
  } = inject<ItemTreeService>(itemTreeToken)!;
  const { noteIconRef, notebookIconRef } = useDragIcon();

  let movingItem: TreeItem | null = null;
  const timerMap = new Map();

  const service = {
    handleDragstart: (event: DragEvent, item: TreeItem) => {
      const icon = Notebook.isA(item)
        ? notebookIconRef.value!
        : noteIconRef.value;

      if (Notebook.isA(item)) {
        foldNotebook(item);
      }

      movingItem = item;
      event.dataTransfer!.setDragImage(icon!, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },

    handleDragenter: (item: TreeItem) => {
      if (!Notebook.isA(item) || item.isEqual(movingItem)) {
        return;
      }

      timerMap.set(
        item.id,
        setTimeout(partial(expandNotebook, item), EXPAND_WAIT_TIME),
      );
    },

    handleNotebookDrop: (item: TreeItem) => {
      if (!Notebook.isA(item)) {
        return;
      }

      // antd-vue 的 Tree 组件是先触发 drop 才触发 dragenter 时间的
      // 因此这里需要一个延时
      setTimeout(() => {
        clearTimeout(timerMap.get(item.id));
        // 400 这个数字来自
        // https://github.com/vueComponent/ant-design-vue/blob/e30077dd8334c5aaf2c094a46401f10e6f662ad9/components/vc-tree/src/Tree.jsx#L321
      }, 400);

      moveTo(movingItem!, item);
    },

    handleDragleave: ({ node }: TreeDragEvent) => {
      const item = node.dataRef.item;

      if (!Notebook.isA(item)) {
        return;
      }

      clearTimeout(timerMap.get(item.id));
    },

    handleRootDrop() {
      moveTo(movingItem!, root.value!);
      movingItem = null;
    },

    handleDragend: () => {
      movingItem = null;
    },
  };

  provide(token, service);
  return service;
}
