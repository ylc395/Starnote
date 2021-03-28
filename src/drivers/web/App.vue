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
import { selfish } from 'utils/index';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    const itemTreeService = selfish(new ItemTreeService());
    const editorService = selfish(new EditorService(itemTreeService));

    provide(itemTreeToken, itemTreeService);
    provide(editorToken, editorService);
  },
});
</script>
<template>
  <main class="flex h-screen select-none">
    <Explorer />
    <EditorArea />
  </main>
</template>
