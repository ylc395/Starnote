<script lang="ts">
import { defineComponent } from 'vue';
import Editor from './Editor/index.vue';
import EditorTab from './EditorTab/index.vue';

export default defineComponent({
  components: { Editor, EditorTab },
});
</script>
<template>
  <section class="flex-grow">
    <EditorTab />
    <Editor />
  </section>
</template>
