<script lang="ts">
import { defineComponent, provide } from 'vue';
import DragIcon from './DragIcon/index.vue';
import { useDragIcon } from './DragIcon/useDragIcon';
import TreeViewer from './TreeViewer/index.vue';
import NoteList from './NoteList/index.vue';
import {
  ItemTreeService,
  token as token1,
} from 'domain/service/ItemTreeService';
import {
  NoteListService,
  token as token2,
} from 'domain/service/NoteListService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { TreeViewer, NoteList, DragIcon },
  setup() {
    const itemTreeService = selfish(new ItemTreeService());

    provide(token1, itemTreeService);
    provide(token2, selfish(new NoteListService(itemTreeService)));
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
