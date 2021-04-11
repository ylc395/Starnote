<script lang="ts">
import { defineComponent } from 'vue';
import { Editor } from 'domain/entity';
import { useEditor } from './useEditor';

export default defineComponent({
  props: {
    editor: { type: Editor, required: true },
  },
  setup({ editor }) {
    const { titleRef, editorRef } = useEditor(editor);
    const { stopAutoSave, autoSave, title, note } = editor;
    return { titleRef, editorRef, stopAutoSave, autoSave, title, note };
  },
});
</script>
<template>
  <div @focusout="stopAutoSave" @focusin="autoSave">
    <div>
      <input
        ref="titleRef"
        v-model="title"
        v-if="!note.isIndexNote"
        class="w-full border-0 text-xl py-2 px-4 focus:outline-none"
        placeholder="笔记标题"
      />
    </div>
    <div ref="editorRef"></div>
  </div>
</template>
