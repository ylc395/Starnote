import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import type { ExpendEvent, TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { computed, inject } from 'vue';
import { Notebook } from 'domain/entity';

export function useTreeData() {
  const notebookTreeService = inject<NotebookTreeService>(token)!;

  return {
    treeData: computed<TreeDataItem>(() => {
      const root = notebookTreeService.root.value;

      if (!root || !root.children.value) {
        return [];
      }

      return root.children.value.map(function mapper(item): TreeDataItem {
        return {
          item,
          class: '', // set class property to make rt reactive
          key: item.id,
          title: item.title.value,
          isLeaf: !Notebook.isA(item),
          children: Notebook.isA(item)
            ? item.children.value?.map(mapper) ?? undefined
            : undefined,
        };
      });
    }),

    handleExpand(ids: Notebook['id'], { expanded, node }: ExpendEvent) {
      const { key } = node.dataRef;

      if (expanded) {
        notebookTreeService.expandNotebook(key);
      }
    },
  };
}