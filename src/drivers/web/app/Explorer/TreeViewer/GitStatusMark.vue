<script lang="ts">
import { defineComponent } from 'vue';
import { GIT_STATUS_MARKS } from 'domain/entity';

export default defineComponent({
  props: {
    mark: {
      type: String,
      required: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (val: any) => {
        return GIT_STATUS_MARKS.includes(val);
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
    class="px-1 py-0.5 text-white text-xs"
    >{{ mark }}</span
  >
</template>
