<script lang="ts">
import { defineComponent } from 'vue';
import NotebookTree from './NotebookTree/index.vue';

export default defineComponent({
  components: { NotebookTree },
});
</script>
<template>
  <div class="tree-viewer min-h-screen">
    <NotebookTree />
  </div>
</template>
<style scoped>
.tree-viewer {
  background-color: rgba(55, 65, 81);
}
</style>
