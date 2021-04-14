<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    mark: {
      type: String,
      required: true,
      validator: (val: string) => {
        return ['M', 'R', 'A', 'D', 'unknown'].includes(val);
      },
    },
  },
});
</script>
<template>
  <span
    v-if="mark !== 'unknown'"
    :class="{
      'bg-red-500': mark === 'D',
      'bg-green-500': mark === 'A',
      'bg-yellow-500': ['M', 'R'].includes(mark),
    }"
    class="mr-2 px-1 py-0.5 text-white text-xs"
    >{{ mark }}</span
  >
</template>
