<script lang="ts">
import { defineComponent, provide } from '@vue/runtime-core';
import Explorer from './app/Explorer/index.vue';
import EditorArea from './app/EditorArea/index.vue';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  NoteListService,
  token as noteListToken,
} from 'domain/service/NoteListService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    const itemTreeService = selfish(new ItemTreeService());
    const editorService = selfish(new EditorService(itemTreeService));
    const noteListService = selfish(new NoteListService(itemTreeService));

    provide(itemTreeToken, itemTreeService);
    provide(editorToken, editorService);
    provide(noteListToken, noteListService);
  },
});
</script>
<template>
  <main class="flex h-screen">
    <Explorer />
    <EditorArea />
  </main>
</template>
