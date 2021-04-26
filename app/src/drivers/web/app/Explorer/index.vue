<script lang="ts">
import { defineComponent } from 'vue';
import DragIcon from './DragIcon/index.vue';
import { useDrag } from './useDrag';
import TreeViewer from './TreeViewer/index.vue';

export default defineComponent({
  components: { TreeViewer, DragIcon },
  setup() {
    useDrag();
  },
});
</script>
<template>
  <aside>
    <TreeViewer />
    <DragIcon />
  </aside>
</template>
