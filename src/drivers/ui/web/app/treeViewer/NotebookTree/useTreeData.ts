import type { TreeViewerService } from 'domain/service/TreeViewerService';
import type { ExpendEvent, TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { computed } from 'vue';
import { Notebook } from 'domain/entity';

export function useTreeData(treeViewerService: TreeViewerService) {
  return {
    treeData: computed<TreeDataItem>(() => {
      const root = treeViewerService.root.value;

      if (!root || !root.children.value) {
        return [];
      }

      return root.children.value.map(function mapper(item): TreeDataItem {
        const isNotebook = item instanceof Notebook;

        return {
          key: item.id,
          title: item.title.value,
          isLeaf: !isNotebook,
          children: isNotebook
            ? (item as Notebook).children.value?.map(mapper) ?? undefined
            : undefined,
        };
      });
    }),

    handleExpand(ids: Notebook['id'], { expanded, node }: ExpendEvent) {
      const { key } = node.dataRef;

      if (expanded) {
        treeViewerService.expandNotebook(key);
      }
    },
  };
}
