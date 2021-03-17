<script lang="ts">
import { defineComponent, inject } from 'vue';
import { token } from './useNotebookCreate';
import { Input, Button, Modal } from 'ant-design-vue';

export default defineComponent({
  components: { Input, Button, Modal },
  setup() {
    const { title, isCreating, stopCreating } = inject(token)!;

    return {
      title,
      isCreating,
      stopCreating,
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
