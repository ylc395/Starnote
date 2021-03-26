<script lang="ts">
import { defineComponent } from 'vue';
import ItemTree from './ItemTree/index.vue';
import Resizable from 'vue-resizable';

export default defineComponent({
  components: { ItemTree, Resizable },
});
</script>
<template>
  <Resizable class="tree-viewer h-full" :active="['r']" width="15rem">
    <ItemTree />
  </Resizable>
</template>
<style scoped>
.tree-viewer {
  background-color: rgba(55, 65, 81);
}
</style>
