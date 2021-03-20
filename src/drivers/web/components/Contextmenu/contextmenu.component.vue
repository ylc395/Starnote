<script lang="ts">
import { defineComponent, inject, computed } from 'vue';
import { ContextmenuService } from './contextmenu.service';
import { Menu } from 'ant-design-vue';

export default defineComponent({
  components: { Menu },
  props: {
    token: {
      type: Symbol,
      required: true,
    },
  },
  setup(props: { token: ContextmenuService['token'] }) {
    const { visible, position, context } = inject(props.token)!;

    return {
      context,
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
