<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import type { Ref } from 'vue';
import { Input, Tooltip } from 'ant-design-vue';
import { token } from './useRename';

export default defineComponent({
  components: { Input, Tooltip },
  setup() {
    const inputRef: Ref<null | HTMLInputElement> = ref(null);
    const { title, stopEditing, error } = inject(token)!;

    onMounted(() => {
      inputRef.value!.select();
    });

    return { title, stopEditing, inputRef, error };
  },
});
</script>
<template>
  <Tooltip placement="bottom" :visible="!!error">
    <template #title>{{ error }}</template>
    <Input
      v-model:value="title"
      ref="inputRef"
      @blur="stopEditing()"
      @keyup.enter="stopEditing(true)"
      :class="{ 'border-red-400': error }"
    />
  </Tooltip>
</template>
