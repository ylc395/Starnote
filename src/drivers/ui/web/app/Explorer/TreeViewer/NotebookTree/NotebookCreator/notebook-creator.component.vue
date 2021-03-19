<script lang="ts">
import { defineComponent, inject, onMounted, Ref, ref, computed } from 'vue';
import { NotebookCreatorService } from './notebook-creator.service';
import { Input, Button, Breadcrumb } from 'ant-design-vue';
import { FolderOpenOutlined } from '@ant-design/icons-vue';
import type { Notebook } from 'domain/entity';

export default defineComponent({
  components: {
    Input,
    Button,
    Breadcrumb,
    BreadcrumbItem: Breadcrumb.Item,
    FolderOpenOutlined,
  },
  setup() {
    const { title, isCreating, target, stopCreating } = inject(
      NotebookCreatorService.token,
    )!;
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
      path: computed(() => {
        let node: Notebook | null = target.value;
        const path = [];
        while (node) {
          if (!node.isRoot) {
            path.push(node.title.value);
          }
          node = node.getParent();
        }

        return path.reverse();
      }),
      handleEnter,
    };
  },
});
</script>
<template>
  <div @submit.prevent>
    <Breadcrumb class="mb-4">
      <BreadcrumbItem><FolderOpenOutlined /> 根目录</BreadcrumbItem>
      <BreadcrumbItem v-for="p of path" :key="p">{{ p }}</BreadcrumbItem>
    </Breadcrumb>
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
