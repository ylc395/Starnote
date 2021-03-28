<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import type { Ref } from 'vue';
import { Input } from 'ant-design-vue';
import { token } from './useRename';

export default defineComponent({
  components: {
    Input,
  },
  setup() {
    const inputRef: Ref<null | HTMLInputElement> = ref(null);
    const { title, stopEditing } = inject(token)!;

    onMounted(() => {
      inputRef.value!.select();
    });

    return {
      title,
      stopEditing,
      inputRef,
    };
  },
});
</script>
<template>
  <Input
    v-model:value="title"
    ref="inputRef"
    @blur="stopEditing()"
    @keyup.enter="stopEditing(true)"
  />
</template>
