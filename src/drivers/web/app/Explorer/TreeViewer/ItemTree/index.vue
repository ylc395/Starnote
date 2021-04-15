<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tree, Modal } from 'ant-design-vue';
import {
  FolderOutlined,
  PlusOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import Renamer from './Renamer/index.vue';
import { useRename } from './Renamer/useRename';
import NotebookCreator from './NotebookCreator/index.vue';
import { useNotebookCreator } from './NotebookCreator/useNotebookCreator';
import Contextmenu from '../../Contextmenu/index.vue';
import { useContextmenu } from '../../Contextmenu/useContextmenu';
import { token as dragToken } from '../../useDrag';
import { useTreeData } from './useTreeData';
import CollapsePanel from '../CollapsePanel.vue';

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
    CollapsePanel,
  },
  setup() {
    const creator = useNotebookCreator();
    const renamer = useRename();
    const { renamingItem } = renamer;
    const { isCreating, startCreating } = creator;
    const { open: openContextmenu } = useContextmenu(creator, renamer);
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
      handleNotebookDrop,
      handleRootDrop,
    } = inject(dragToken)!;

    return {
      handleExpand,
      handleSelect,
      isCreating,
      startCreating,
      handleDragstart,
      handleDragenter,
      handleNotebookDrop,
      handleDragend,
      handleDragleave,
      handleRootDrop,
      openContextmenu,
      treeData,
      expandedKeys,
      selectedKeys,
      renamingItem,
    };
  },
});
</script>
<template>
  <CollapsePanel title="Notebooks" @headerDrop="handleRootDrop">
    <template #icon>
      <FolderOutlined />
    </template>
    <template #extra>
      <button @click="startCreating()">
        <PlusOutlined />
      </button>
    </template>
    <Tree
      draggable
      class="overflow-y-auto pl-3"
      :treeData="treeData"
      :showIcon="false"
      openAnimation="none"
      expandAction="dblclick"
      :expandedKeys="expandedKeys"
      :selectedKeys="selectedKeys"
      @expand="handleExpand"
      @select="handleSelect"
      @dragstart="handleDragstart($event.event, $event.node.dataRef.item)"
      @dragenter="handleDragenter($event.node.dataRef.item)"
      @drop="handleNotebookDrop($event.node.dataRef.item)"
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
    >
      <NotebookCreator />
    </Modal>
    <Contextmenu />
  </CollapsePanel>
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
</style>
