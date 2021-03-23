<script lang="ts">
import { defineComponent, inject } from 'vue';
import { token, EditorService } from 'domain/service/EditorService';

export default defineComponent({
  setup() {
    const { activeEditor } = inject<EditorService>(token)!;

    return { activeEditor };
  },
});
</script>
<template>
  <div v-if="activeEditor">
    <input v-model="activeEditor.title.value" />
    <textarea v-model="activeEditor.content.value"></textarea>
  </div>
</template>
