import { ItemTreeService, token } from 'domain/service/ItemTreeService';
import type { ExpendEvent, TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { computed, inject } from 'vue';
import { Notebook } from 'domain/entity';

export function useTreeData() {
  const { itemTree, expandNotebook } = inject<ItemTreeService>(token)!;

  return {
    treeData: computed<TreeDataItem>(() => {
      const root = itemTree.root.value;

      if (!root || !root.children.value) {
        return [];
      }

      return root.children.value.map(function mapper(item): TreeDataItem {
        return {
          item,
          class: item.withContextmenu.value ? 'with-contextmenu' : '', // set class property to make rt reactive
          key: item.id,
          title: item.title.value,
          isLeaf: !Notebook.isA(item),
          children: Notebook.isA(item)
            ? item.children.value?.map(mapper) ?? undefined
            : undefined,
        };
      });
    }),

    handleExpand(_: never, { expanded, node }: ExpendEvent) {
      const { item } = node.dataRef;

      if (expanded && Notebook.isA(item)) {
        expandNotebook(item);
      }
    },
  };
}
