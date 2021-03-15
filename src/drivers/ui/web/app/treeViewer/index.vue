<script lang="ts">
import { defineComponent, computed, provide } from 'vue';
import { Tree } from 'ant-design-vue';
import { PlusOutlined, FolderOutlined } from '@ant-design/icons-vue';
import { ExpendEvent, TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { container } from 'tsyringe';
import {
  TreeViewerService,
  NotebookCreatingService,
} from 'domain/service/treeViewer';
import { Notebook } from 'domain/entity';
import NotebookCreating from './NotebookCreating.vue';

export default defineComponent({
  components: { Tree, PlusOutlined, FolderOutlined, NotebookCreating },
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
      treeData,
      expandedKeys: treeViewerService.expandedIds,
      selectedKeys: treeViewerService.selectedIds,
      startCreating,
      handleExpand,
    };
  },
});
</script>
<template>
  <div class="notebook-tree-viewer select-none h-screen">
    <div class="text-white flex justify-between items-center px-2 py-2">
      <h1 class="text-inherit text-sm uppercase my-0">
        <FolderOutlined class="mr-1" />
        Notebooks
      </h1>
      <button
        @click="startCreating"
        class="bg-transparent border-none cursor-pointer focus:outline-none"
      >
        <PlusOutlined />
      </button>
    </div>
    <Tree
      class="overflow-x-hidden"
      :treeData="treeData"
      :blockNode="true"
      openAnimation="none"
      @expand="handleExpand"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
    />
    <NotebookCreating />
  </div>
</template>
<style scoped>
.notebook-tree-viewer {
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
