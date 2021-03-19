<script lang="ts">
import { defineComponent, provide } from '@vue/runtime-core';
import Explorer from './app/Explorer/index.vue';
import EditorArea from './app/EditorArea/index.vue';
import { EditorService, token } from 'domain/service/EditorService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    provide(token, selfish(new EditorService()));
  },
});
</script>
<template>
  <main class="flex flex-row">
    <Explorer />
    <EditorArea />
  </main>
</template>
