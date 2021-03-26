<script lang="ts">
import { defineComponent } from 'vue';
import DragIcon from './DragIcon/index.vue';
import { useDragIcon } from './DragIcon/useDragIcon';
import TreeViewer from './TreeViewer/index.vue';
import NoteList from './NoteList/index.vue';

export default defineComponent({
  components: { TreeViewer, NoteList, DragIcon },
  setup() {
    useDragIcon();
  },
});
</script>
<template>
  <section class="flex h-screen">
    <TreeViewer />
    <NoteList />
    <DragIcon />
  </section>
</template>
