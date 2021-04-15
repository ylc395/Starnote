import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import type {
  ExpendEvent,
  SelectEvent,
  TreeDataItem,
} from 'ant-design-vue/lib/tree/Tree';
import { computed, inject } from 'vue';
import { Notebook, TreeItem, ViewMode } from 'domain/entity';
import { map } from 'lodash';

export function useTreeData() {
  const {
    itemTree: {
      root,
      mode,
      setSelectedItem,
      selectedItem,
      expandedItems,
      foldNotebook,
      expandNotebook,
    },
  } = inject<ItemTreeService>(itemTreeToken)!;

  return {
    treeData: computed<TreeDataItem[]>(() => {
      const notebookFilter = (item: TreeItem) => {
        if (mode.value === ViewMode.OneColumn) {
          return true;
        }

        return Notebook.isA(item);
      };

      const mapper = (item: TreeItem): TreeDataItem => {
        return {
          item,
          class: item.withContextmenu.value ? 'with-contextmenu' : '',
          key: item.id,
          slots: { title: 'title' },
          isLeaf: !Notebook.isA(item),
          children: Notebook.isA(item)
            ? item.sortedChildren.value.filter(notebookFilter).map(mapper)
            : undefined,
        };
      };

      return root.children.value.filter(notebookFilter).map(mapper) || [];
    }),

    selectedKeys: computed(() => [selectedItem.value?.id]),
    expandedKeys: computed(() => map(expandedItems, 'id')),

    handleSelect(_: never, { selected, node }: SelectEvent) {
      const { item } = node.dataRef;

      if (selected) {
        setSelectedItem(item);
      }
    },

    handleExpand(_: never, { expanded, node }: ExpendEvent) {
      const { item } = node.dataRef;

      if (!Notebook.isA(item)) {
        return;
      }

      if (expanded) {
        expandNotebook(item);
      } else {
        foldNotebook(item);
      }
    },
  };
}
