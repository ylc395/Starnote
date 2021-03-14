<script lang="ts">
import { defineComponent, computed, provide } from 'vue';
import { Button, Tree } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { ExpendEvent, TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { container } from 'tsyringe';
import {
  TreeViewerService,
  NotebookCreatingService,
  TreeItemId,
} from 'domain/service/treeViewer';
import { Notebook } from 'domain/entity';
import NotebookCreating from './NotebookCreating.vue';

export default defineComponent({
  components: { Button, Tree, PlusOutlined, NotebookCreating },
  setup() {
    const treeViewerService = container.resolve(TreeViewerService);
    const notebookCreatingService = new NotebookCreatingService(
      treeViewerService,
    );

    provide(NotebookCreatingService.token, notebookCreatingService);

    const treeData = computed<TreeDataItem>(() => {
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
    });

    const handleSelect = ([id]: TreeItemId[]) => {
      if (id) {
        treeViewerService.setSelectedItem(id);
      } else {
        treeViewerService.resetSelectedItem();
      }
    };

    const handleExpand = (
      ids: Notebook['id'],
      { expanded, node }: ExpendEvent,
    ) => {
      const { key } = node.dataRef;

      if (expanded) {
        treeViewerService.expandNotebook(key);
      } else {
        treeViewerService.removeExpandedId(key);
      }
    };

    const startCreating = () => {
      notebookCreatingService.startCreating();
    };

    return {
      expandedKeys: treeViewerService.expandedIds,
      treeData,
      startCreating,
      handleSelect,
      handleExpand,
    };
  },
});
</script>
<template>
  <div class="notebook-tree-viewer">
    <Button :block="true" @click="startCreating">
      <template #icon> <PlusOutlined /> 创建笔记本</template>
    </Button>
    <Tree
      :treeData="treeData"
      :blockNode="true"
      :openAnimation="false"
      @select="handleSelect"
      @expand="handleExpand"
      v-model:expandedKeys="expandedKeys"
    />
    <NotebookCreating />
  </div>
</template>
<style scoped>
.notebook-tree-viewer {
  user-select: none;
  height: 100vh;
  background-color: rgba(55, 65, 81);
}

.ant-tree :deep(li) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.ant-tree-title) {
  color: #eeeeee;
  font-size: 16px;
}

:deep(.ant-tree-switcher) {
  color: #7c7e81;
}

:deep(.ant-tree-treenode-selected) {
  position: relative;
  left: -9999px;
  padding-left: 9999px;
  width: 9999px;
  box-sizing: content-box;
  background-color: #131313;
}
.ant-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: inherit;
}

.ant-tree :deep(.ant-tree-node-content-wrapper) {
  padding-left: 0;
  margin: 3px 0;
  transition-duration: 0s;
}

.ant-tree :deep(.ant-tree-switcher) {
  margin: 3px 0;
}

.ant-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: inherit;
}

:deep(.ant-tree-child-tree) {
  position: relative;
  left: -9999px;
  padding-left: calc(9999px + 18px);
  width: 9999px;
  box-sizing: content-box;
  background-color: rgba(55, 65, 81);
}
</style>
