<script lang="ts">
import { defineComponent, inject } from 'vue';
import { NotebookCreatingService } from 'domain/service/treeViewer';
import { Input, Button, Modal } from 'ant-design-vue';

export default defineComponent({
  components: { Input, Button, Modal },
  setup() {
    const creatingService = inject<NotebookCreatingService>(
      NotebookCreatingService.token,
    )!;

    return {
      title: creatingService.title,
      isCreating: creatingService.isCreating,
      stopCreating: creatingService.stopCreating.bind(creatingService),
    };
  },
});
</script>
<template>
  <Modal :visible="isCreating">
    <form>
      <Input v-model:value="title" placeholder="新笔记本标题" />
      <Button @click="stopCreating(true)">确定</Button>
      <Button @click="stopCreating(false)">取消</Button>
    </form>
  </Modal>
</template>
