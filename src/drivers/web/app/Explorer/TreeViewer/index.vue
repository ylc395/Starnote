<script lang="ts">
import { defineComponent } from 'vue';
import ItemTree from './ItemTree/index.vue';
import StarList from './StarList/index.vue';
import Resizable from 'vue-resizable';

export default defineComponent({
  components: { StarList, ItemTree, Resizable },
});
</script>
<template>
  <aside>
    <Resizable class="tree-viewer h-full" :active="['r']" width="15rem">
      <StarList />
      <ItemTree />
    </Resizable>
  </aside>
</template>
<style scoped>
.tree-viewer {
  background-color: rgba(55, 65, 81);
}

@layer components {
  :deep(.tree-viewer-header) {
    @apply text-white p-2 flex justify-between items-center;
  }

  :deep(.tree-viewer-title) {
    @apply text-inherit text-sm uppercase my-0;
  }

  :deep(.tree-viewer-icon) {
    @apply mr-1;
  }
}
</style>
