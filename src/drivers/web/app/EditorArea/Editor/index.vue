<script lang="ts">
import { defineComponent, inject, Ref, ref, watchEffect } from 'vue';
import { token, EditorService } from 'domain/service/EditorService';

export default defineComponent({
  setup() {
    const {
      editorManager: { activeEditor },
    } = inject<EditorService>(token)!;

    const titleRef: Ref<HTMLElement | null> = ref(null);
    const contentRef: Ref<HTMLElement | null> = ref(null);

    watchEffect(() => {
      const isNewNote = activeEditor.value?.note.value!.isJustCreated;

      if (isNewNote) {
        (titleRef.value || contentRef.value)?.focus();
      } else {
        contentRef.value?.focus();
      }
    });

    return { activeEditor, titleRef, contentRef };
  },
});
</script>
<template>
  <div v-if="activeEditor">
    <input
      ref="titleRef"
      v-model="activeEditor.title.value"
      v-if="!activeEditor.note.value.isIndexNote"
    />
    <textarea ref="contentRef" v-model="activeEditor.content.value"></textarea>
  </div>
</template>
