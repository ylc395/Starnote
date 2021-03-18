<script lang="ts">
import { defineComponent, provide } from 'vue';
import TreeViewer from './TreeViewer/index.vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';

export default defineComponent({
  components: { TreeViewer },
  setup() {
    provide(token, new NotebookTreeService());
  },
});
</script>
<template>
  <section class="min-h-screen">
    <TreeViewer />
  </section>
</template>
