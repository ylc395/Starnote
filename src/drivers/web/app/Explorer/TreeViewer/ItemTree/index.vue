<script lang="ts">
import { defineComponent } from 'vue';
import { Tree, Modal } from 'ant-design-vue';
import {
  FolderOutlined,
  PlusOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { TreeItem } from 'domain/entity';
import Renamer from './Renamer/index.vue';
import { useRename } from './Renamer/useRename';
import NotebookCreator from './NotebookCreator/index.vue';
import { useNotebookCreator } from './NotebookCreator/useNotebookCreator';
import Contextmenu from '../../Contextmenu/index.vue';
import { useContextmenu as useCommonContextmenu } from 'drivers/web/components/Contextmenu/useContextmenu';
import { useDraggable } from './useDraggable';
import { useTreeData } from './useTreeData';

export default defineComponent({
  components: {
    Tree: Tree.DirectoryTree,
    Modal,
    PlusOutlined,
    FolderOutlined,
    FileOutlined,
    NotebookCreator,
    Renamer,
    Contextmenu,
  },
  setup() {
    const { isCreating, startCreating } = useNotebookCreator();
    const { renamingItem } = useRename();
    const { open: openContextmenu } = useCommonContextmenu<TreeItem>();

    const {
      treeData,
      handleExpand,
      handleSelect,
      selectedKeys,
      expandedKeys,
    } = useTreeData();
    const {
      handleDragstart,
      handleDragenter,
      handleDragend,
      handleDragleave,
      handleDrop,
      handleRootDrop,
    } = useDraggable();

    return {
      handleExpand,
      handleSelect,
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
      expandedKeys,
      selectedKeys,
      renamingItem,
      getModalContainer: () => document.querySelector('#app'),
    };
  },
});
</script>
<template>
  <div class="flex flex-col">
    <div class="tree-viewer-header">
      <h1 class="tree-viewer-title" @dragover.prevent @drop="handleRootDrop">
        <FolderOutlined class="tree-viewer-icon" ref="notebookIconRef" />
        Notebooks
      </h1>
      <button
        @click="startCreating()"
        class="bg-transparent border-none cursor-pointer focus:outline-none"
      >
        <PlusOutlined />
      </button>
    </div>
    <Tree
      draggable
      class="overflow-y-auto"
      :treeData="treeData"
      :showIcon="false"
      openAnimation="none"
      expandAction="dblclick"
      :expandedKeys="expandedKeys"
      :selectedKeys="selectedKeys"
      @expand="handleExpand"
      @select="handleSelect"
      @dragstart="handleDragstart"
      @dragenter="handleDragenter"
      @drop="handleDrop"
      @dragend="handleDragend"
      @dragleave="handleDragleave"
      @rightClick="openContextmenu($event.event, $event.node.dataRef.item)"
    >
      <template #title="{ item }">
        <Renamer v-if="renamingItem === item" />
        <template v-else>
          {{ item.title.value }}
        </template>
        <FileOutlined
          v-if="item.indexNote && item.indexNote.value"
          class="ml-1 opacity-80"
          title="这是一个目录笔记"
        />
      </template>
    </Tree>
    <Modal
      :visible="isCreating"
      :footer="null"
      :closable="false"
      :width="400"
      :destroyOnClose="true"
      :getContainer="getModalContainer"
    >
      <NotebookCreator />
    </Modal>
    <Contextmenu />
  </div>
</template>
<style scoped>
/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
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
  -left: 10px !important;
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

:deep(.item-tree-root) {
  position: relative;
  left: -10px;
  top: -30px;
  z-index: 5;
}
</style>
