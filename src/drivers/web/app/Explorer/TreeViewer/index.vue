<script lang="ts">
import { defineComponent } from 'vue';
import ItemTree from './ItemTree/index.vue';

export default defineComponent({
  components: { ItemTree },
});
</script>
<template>
  <div class="tree-viewer min-h-screen w-60">
    <ItemTree />
  </div>
</template>
<style scoped>
.tree-viewer {
  background-color: rgba(55, 65, 81);
}
</style>
