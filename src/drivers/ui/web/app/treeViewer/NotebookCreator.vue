<script lang="ts">
import { defineComponent, inject, onMounted, Ref, ref } from 'vue';
import { token } from './useNotebookCreate';
import { Input, Button } from 'ant-design-vue';
import { FolderOpenOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: { Input, Button, FolderOpenOutlined },
  setup() {
    const { title, isCreating, stopCreating, parent } = inject(token)!;
    const inputRef: Ref<null | HTMLInputElement> = ref(null);
    const handleEnter = () => {
      if (!title.value) {
        return;
      }
      stopCreating(true);
    };

    onMounted(() => {
      inputRef.value!.focus();
    });

    return {
      title,
      isCreating,
      stopCreating,
      inputRef,
      parent,
      handleEnter,
    };
  },
});
</script>
<template>
  <div @submit.prevent>
    <p><FolderOpenOutlined /> {{ parent.isRoot ? '根目录' : parent.title }}</p>
    <Input
      v-model:value="title"
      placeholder="新笔记本标题"
      ref="inputRef"
      @keyup.enter="handleEnter"
    />
    <div class="text-right mt-5">
      <Button
        :disabled="!title"
        @click="stopCreating(true)"
        type="primary"
        class="mr-2"
        >确定</Button
      >
      <Button @click="stopCreating(false)">取消</Button>
    </div>
  </div>
</template>
