<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import TreeViewer from './app/TreeViewer/NotebookTree/index.vue';

export default defineComponent({
  components: { TreeViewer },
});
</script>
<template>
  <TreeViewer />
</template>
