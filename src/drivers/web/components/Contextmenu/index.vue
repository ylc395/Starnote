<script lang="ts">
import { defineComponent, inject, computed } from 'vue';
import { Menu } from 'ant-design-vue';
import { useContextmenu, token } from './useContextmenu';

export default defineComponent({
  components: { Menu },
  setup() {
    const { visible, position } = inject<ReturnType<typeof useContextmenu>>(
      token,
    )!;

    return {
      visible,
      position: computed(() => {
        return {
          left: position.value.x + 'px',
          top: position.value.y + 'px',
        };
      }),
    };
  },
});
</script>
<template>
  <Menu v-bind="$attrs" v-if="visible" :style="position" class="fixed z-50">
    <slot></slot>
  </Menu>
</template>
