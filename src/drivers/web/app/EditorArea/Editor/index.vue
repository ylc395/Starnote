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
    return { titleRef, editorRef };
  },
});
</script>
<template>
  <div>
    <div>
      <input
        ref="titleRef"
        v-model="editor.title.value"
        v-if="!editor.note.value.isIndexNote"
        class="w-full border-0 text-xl py-2 px-4 focus:outline-none"
        placeholder="笔记标题"
      />
    </div>
    <div ref="editorRef"></div>
  </div>
</template>
