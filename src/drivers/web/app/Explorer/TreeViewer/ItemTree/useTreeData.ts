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
import { Notebook } from 'domain/entity';
import { map } from 'lodash';

export function useTreeData() {
  const {
    itemTree: {
      root: _root,
      setSelectedItem,
      selectedItem,
      expandedItems,
      foldNotebook,
      expandNotebook,
    },
  } = inject<ItemTreeService>(itemTreeToken)!;

  return {
    treeData: computed<TreeDataItem>(() => {
      const root = _root.value;

      if (!root || !root.children.value) {
        return [];
      }

      return root.children.value.map(function mapper(item): TreeDataItem {
        return {
          item,
          class: item.withContextmenu.value ? 'with-contextmenu' : '', // set class property to make rt reactive
          key: item.id,
          slots: { title: 'title' },
          isLeaf: !Notebook.isA(item),
          children: Notebook.isA(item)
            ? item.children.value?.map(mapper) ?? undefined
            : undefined,
        };
      });
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
