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
  <div class="bg-gray-700 select-none h-screen">
    <Button :block="true" @click="startCreating">
      <template #icon> <PlusOutlined /> 创建笔记本</template>
    </Button>
    <Tree
      :treeData="treeData"
      :blockNode="true"
      @select="handleSelect"
      @expand="handleExpand"
      v-model:expandedKeys="expandedKeys"
    />
    <NotebookCreating />
  </div>
</template>
<style scoped>
.ant-tree >>> .ant-tree-title {
  color: #eeeeee;
  font-size: 16px;
}

.ant-tree >>> .ant-tree-switcher {
  color: #7c7e81;
}

.ant-tree >>> .ant-tree-treenode-selected,
.ant-tree >>> .ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: #131313;
}

.ant-tree >>> .ant-tree-treenode-selected:hover,
.ant-tree >>> .ant-tree-treenode-selected:hover .ant-tree-node-content-wrapper,
.ant-tree >>> li:hover,
.ant-tree >>> li .ant-tree-node-content-wrapper:hover {
  background-color: #26282d;
}
</style>
