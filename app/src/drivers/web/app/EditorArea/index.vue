<script lang="ts">
import { defineComponent } from 'vue';
import Editor from './Editor/index.vue';
import EditorTab from './EditorTab/index.vue';
import { useLintWorker } from './useLintWorker';

export default defineComponent({
  components: { Editor, EditorTab },
  setup() {
    useLintWorker();
  },
});
</script>
<template>
  <section class="flex-grow h-full w-1/2">
    <EditorTab class="h-full">
      <template v-slot="{ editor }">
        <Editor :editor="editor" />
      </template>
    </EditorTab>
  </section>
</template>
