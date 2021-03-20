<script lang="ts">
import { defineComponent, inject } from 'vue';
import { FolderOutlined, FileOutlined } from '@ant-design/icons-vue';
import { token } from './useDragIcon';

export default defineComponent({
  components: { FolderOutlined, FileOutlined },
  setup() {
    const { noteIconRef, notebookIconRef } = inject(token)!;

    return { noteIconRef, notebookIconRef };
  },
});
</script>
<template>
  <div class="absolute -left-96 text-gray-400">
    <FileOutlined ref="noteIconRef" />
    <FolderOutlined ref="notebookIconRef" />
  </div>
</template>
