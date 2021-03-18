<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import Explorer from './app/Explorer/index.vue';

export default defineComponent({
  components: { Explorer },
});
</script>
<template>
  <main>
    <Explorer />
  </main>
</template>
