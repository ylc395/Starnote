<script lang="ts">
import { defineComponent, provide } from 'vue';
import { FolderOutlined, FileOutlined } from '@ant-design/icons-vue';
import { useDragIcon } from './useDragIcon';
import TreeViewer from './TreeViewer/index.vue';
import NoteList from './NoteList/index.vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { TreeViewer, NoteList, FolderOutlined, FileOutlined },
  setup() {
    provide(token, selfish(new NotebookTreeService()));

    const { noteIconRef, notebookIconRef } = useDragIcon();

    return { noteIconRef, notebookIconRef };
  },
});
</script>
<template>
  <section class="flex flex-row">
    <TreeViewer />
    <NoteList />
    <div class="absolute -left-96 text-gray-400">
      <FileOutlined ref="noteIconRef" />
      <FolderOutlined ref="notebookIconRef" />
    </div>
  </section>
</template>
