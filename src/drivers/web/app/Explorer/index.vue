<script lang="ts">
import { defineComponent, provide } from 'vue';
import TreeViewer from './TreeViewer/index.vue';
import NoteList from './NoteList/index.vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { ContextmenuService } from 'drivers/web/components/Contextmenu/contextmenu.service';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { TreeViewer, NoteList },
  setup() {
    provide(token, selfish(new NotebookTreeService()));
    ContextmenuService.setup();
  },
});
</script>
<template>
  <section class="flex flex-row">
    <TreeViewer />
    <NoteList />
  </section>
</template>
