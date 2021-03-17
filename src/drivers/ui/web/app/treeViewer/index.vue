<script lang="ts">
import { defineComponent, provide, ref, Ref } from 'vue';
import { Tree } from 'ant-design-vue';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { TreeViewerService } from 'domain/service/TreeViewerService';
import NotebookCreating from './NotebookCreator.vue';
import { useDraggable } from './useDraggable';
import { useTreeData } from './useTreeData';
import {
  useNotebookCreate,
  token as NotebookCreateToken,
} from './useNotebookCreate';

export default defineComponent({
  components: {
    Tree: Tree.DirectoryTree,
    PlusOutlined,
    FolderOutlined,
    FileOutlined,
    NotebookCreating,
  },
  setup() {
    const treeViewerService = new TreeViewerService();
    const notebookCreatingService = useNotebookCreate(treeViewerService);

    provide(NotebookCreateToken, notebookCreatingService);

    const notebookIconRef: Ref<null | HTMLElement> = ref(null);
    const noteIconRef: Ref<null | HTMLElement> = ref(null);

    const {
      handleDragstart,
      handleDragenter,
      handleRootDrop,
      handleDragend,
      handleDrop,
    } = useDraggable(treeViewerService, {
      notebookIconRef,
      noteIconRef,
    });

    const { treeData, handleExpand } = useTreeData(treeViewerService);

    return {
      notebookIconRef,
      noteIconRef,
      treeData,
      handleExpand,
      expandedKeys: treeViewerService.expandedIds,
      selectedKeys: treeViewerService.selectedIds,
      startCreating: notebookCreatingService.startCreating,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragend,
      handleRootDrop,
    };
  },
});
</script>
<template>
  <div class="notebook-tree-viewer select-none h-screen">
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
          @click="startCreating()"
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
    />
    <NotebookCreating />
    <div class="-ml-96 text-gray-400">
      <FileOutlined ref="noteIconRef" />
      <FolderOutlined ref="notebookIconRef" />
    </div>
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

:deep(.ant-tree-node-content-wrapper.ant-tree-node-selected::before) {
  background-color: #131313 !important;
}

:deep(.drag-over .ant-tree-node-content-wrapper) {
  background-color: inherit !important;
}
</style>
