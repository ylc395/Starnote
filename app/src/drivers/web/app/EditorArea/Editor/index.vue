<script lang="ts">
import { defineComponent, onMounted } from 'vue';
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
      resetTitle,
      toggleAutoSave,
    } = useEditor(editor);

    onMounted(() => {
      editorRef.value!.style.height = `calc(100% - ${
        titleRef.value?.clientHeight ?? 0
      }px)`;
    });

    return {
      titleRef,
      editorRef,
      titleStatus,
      resetTitle,
      toggleAutoSave,
    };
  },
});
</script>
<template>
  <div @focusin="toggleAutoSave" @focusout="toggleAutoSave" class="h-full">
    <div>
      <input
        ref="titleRef"
        @input="editor.setTitle($event.target.value)"
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
