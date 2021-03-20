<script lang="ts">
import { defineComponent, ref, Ref, inject } from 'vue';
import { Tree, Modal } from 'ant-design-vue';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import NotebookCreator from './NotebookCreator/notebook-creator.component.vue';
import { NotebookCreatorService } from './NotebookCreator/notebook-creator.service';
import Contextmenu from '../../Contextmenu/contextmenu.component.vue';
import { ContextmenuService } from '../../Contextmenu/contextmenu.service';
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
    Contextmenu,
  },
  setup() {
    const notebookIconRef: Ref<null | HTMLElement> = ref(null);
    const noteIconRef: Ref<null | HTMLElement> = ref(null);

    const { expandedIds, selectedIds } = inject<NotebookTreeService>(token)!;
    const { isCreating, startCreating } = NotebookCreatorService.setup();
    const {
      openContextmenu,
      token: contextmenuToken,
    } = ContextmenuService.setup();
    const { treeData, handleExpand } = useTreeData();
    const {
      handleDragstart,
      handleDragenter,
      handleRootDrop,
      handleDragend,
      handleDrop,
    } = useDraggable({
      notebookIconRef,
      noteIconRef,
    });

    return {
      notebookIconRef,
      noteIconRef,
      handleExpand,
      isCreating,
      startCreating,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragend,
      handleRootDrop,
      contextmenuToken,
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
      @rightClick="
        openContextmenu({
          event: $event.event,
          item: $event.node.dataRef.item,
        })
      "
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
    <Contextmenu :token="contextmenuToken" />
    <div class="absolute -left-96 text-gray-400">
      <FileOutlined ref="noteIconRef" />
      <FolderOutlined ref="notebookIconRef" />
    </div>
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

:deep(.ant-tree-node-content-wrapper.ant-tree-node-selected::before) {
  background-color: #131313 !important;
}

:deep(.drag-over .ant-tree-node-content-wrapper) {
  background-color: inherit !important;
}
</style>
