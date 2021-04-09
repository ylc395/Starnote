<script lang="ts">
import { defineComponent, inject, ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { token } from './useNotebookCreator';
import { Input, Button, Breadcrumb } from 'ant-design-vue';
import { FolderOpenOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    Input,
    Button,
    Breadcrumb,
    BreadcrumbItem: Breadcrumb.Item,
    FolderOpenOutlined,
  },
  setup() {
    const inputRef: Ref<null | HTMLInputElement> = ref(null);
    const { title, isCreating, stopCreating, path, handleEnter } = inject(
      token,
    )!;

    onMounted(() => {
      inputRef.value!.focus();
    });

    return {
      title,
      isCreating,
      stopCreating,
      inputRef,
      path,
      handleEnter,
    };
  },
});
</script>
<template>
  <div>
    <Breadcrumb class="mb-4">
      <BreadcrumbItem><FolderOpenOutlined /> </BreadcrumbItem>
      <BreadcrumbItem v-for="p of path" :key="p">{{ p }}</BreadcrumbItem>
    </Breadcrumb>
    <Input
      v-model:value="title"
      placeholder="新笔记本标题"
      ref="inputRef"
      @keyup.enter="handleEnter"
    />
    <div class="text-right mt-5">
      <Button class="mr-2" @click="stopCreating(false)">取消</Button>
      <Button :disabled="!title" @click="stopCreating(true)" type="primary"
        >确定</Button
      >
    </div>
  </div>
</template>
