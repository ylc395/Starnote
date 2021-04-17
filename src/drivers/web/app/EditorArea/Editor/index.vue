<script lang="ts">
import { defineComponent } from 'vue';
import { Editor } from 'domain/entity';
import { useEditor } from './useEditor';

export default defineComponent({
  props: {
    editor: { type: Editor, required: true },
  },
  setup({ editor }) {
    const {
      titleRef,
      editorRef,
      titleStatus,
      setTitle,
      resetTitle,
    } = useEditor(editor);

    return {
      titleRef,
      editorRef,
      setTitle,
      titleStatus,
      resetTitle,
    };
  },
});
</script>
<template>
  <div>
    <div>
      <input
        ref="titleRef"
        @input="setTitle($event.target.value)"
        @blur="resetTitle"
        v-if="!editor.isIndexNote"
        class="w-full border-0 text-xl py-2 px-4 focus:outline-none"
        placeholder="笔记标题"
      />
      <span v-if="titleStatus">{{ titleStatus }}</span>
    </div>
    <div ref="editorRef"></div>
  </div>
</template>
