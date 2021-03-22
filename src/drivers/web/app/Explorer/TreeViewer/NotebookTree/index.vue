<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tree, Modal } from 'ant-design-vue';
import { FolderOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ItemTreeService, token } from 'domain/service/ItemTreeService';
import { TreeItem } from 'domain/entity';
import NotebookCreator from './NotebookCreator/index.vue';
import { useNotebookCreator } from './NotebookCreator/useNotebookCreator';
import Contextmenu from '../../Contextmenu/index.vue';
import { useContextmenu } from 'drivers/web/components/Contextmenu/useContextmenu';
import { useDraggable } from './useDraggable';
import { useTreeData } from './useTreeData';

export default defineComponent({
  components: {
    Tree: Tree.DirectoryTree,
    Modal,
    PlusOutlined,
    FolderOutlined,
    NotebookCreator,
    Contextmenu,
  },
  setup() {
    const {
      itemTree: { expandedIds, selectedIds },
    } = inject<ItemTreeService>(token)!;
    const { isCreating, startCreating } = useNotebookCreator();
    const { open: openContextmenu } = useContextmenu<TreeItem>();

    const { treeData, handleExpand } = useTreeData();
    const {
      handleDragstart,
      handleDragenter,
      handleRootDrop,
      handleDragend,
      handleDragleave,
      handleDrop,
    } = useDraggable();

    return {
      handleExpand,
      isCreating,
      startCreating,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragend,
      handleDragleave,
      handleRootDrop,
      openContextmenu,
      treeData,
      expandedKeys: expandedIds,
      selectedKeys: selectedIds,
    };
  },
});
</script>
<template>
  <div>
    <div class="text-white flex justify-between items-center p-2">
      <h1
        class="text-inherit text-sm uppercase my-0"
        @dragover.prevent
        @drop="handleRootDrop"
      >
        <FolderOutlined class="mr-1" ref="notebookIconRef" />
        Notebooks
      </h1>
      <div>
        <button
          @click="startCreating(true)"
          class="bg-transparent border-none cursor-pointer focus:outline-none"
        >
          <PlusOutlined />
        </button>
      </div>
    </div>
    <Tree
      draggable
      :treeData="treeData"
      :showIcon="false"
      openAnimation="none"
      expandAction="dblclick"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      @expand="handleExpand"
      @dragstart="handleDragstart"
      @dragenter="handleDragenter"
      @drop="handleDrop"
      @dragend="handleDragend"
      @dragleave="handleDragleave"
      @rightClick="openContextmenu($event.event, $event.node.dataRef.item)"
    />
    <Modal
      :visible="isCreating"
      :footer="null"
      :closable="false"
      :width="400"
      :destroyOnClose="true"
    >
      <NotebookCreator />
    </Modal>
    <Contextmenu />
  </div>
</template>
<style scoped>
.ant-tree :deep(li) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.ant-tree-title) {
  color: #eeeeee;
  font-size: 14px;
}

:deep(.ant-tree-switcher) {
  color: #7c7e81;
  cursor: auto !important;
  height: 30px !important;
  width: 17px !important;
  margin-left: 10px !important;
  display: inline-flex !important;
  align-items: center;
}

:deep(.ant-tree-node-content-wrapper) {
  padding-left: 0 !important;
  transition-duration: 0s !important;
  cursor: auto !important;
  height: 30px !important;
  border: 0 !important;
  display: inline-flex !important;
  align-items: center;
}

:deep(.ant-tree-node-content-wrapper::before) {
  height: 30px !important;
  transition-duration: 0s !important;
}

:deep(.ant-tree-node-content-wrapper:hover::before) {
  background-color: inherit !important;
  transition-duration: 0s !important;
}

:deep(.with-contextmenu > .ant-tree-node-content-wrapper::before) {
  background-color: #252525 !important;
}

:deep(.ant-tree-node-content-wrapper.ant-tree-node-selected::before) {
  background-color: #131313 !important;
}

:deep(.drag-over .ant-tree-node-content-wrapper) {
  background-color: inherit !important;
}
</style>
