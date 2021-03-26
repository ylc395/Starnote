<script lang="ts">
import { defineComponent } from 'vue';
import { StarOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    StarOutlined,
  },
});
</script>
<template>
  <div>
    <div class="tree-viewer-header">
      <h1 class="tree-viewer-title">
        <StarOutlined class="tree-viewer-icon" />
        Stars
      </h1>
    </div>
  </div>
</template>
