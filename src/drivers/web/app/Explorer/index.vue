<script lang="ts">
import { defineComponent, provide } from 'vue';
import DragIcon from './DragIcon/index.vue';
import { useDragIcon } from './DragIcon/useDragIcon';
import TreeViewer from './TreeViewer/index.vue';
import NoteList from './NoteList/index.vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { TreeViewer, NoteList, DragIcon },
  setup() {
    provide(token, selfish(new NotebookTreeService()));
    useDragIcon();
  },
});
</script>
<template>
  <section class="flex flex-row">
    <TreeViewer />
    <NoteList />
    <DragIcon />
  </section>
</template>
