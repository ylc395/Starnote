<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  inject,
  computed,
  ComponentPublicInstance,
} from 'vue';
import { ContextmenuService } from './contextmenu.service';
import { Menu } from 'ant-design-vue';

export default defineComponent({
  components: { Menu },
  setup() {
    const contextmenuService = inject(ContextmenuService.token)!;
    const elRef: Ref<ComponentPublicInstance | null> = ref(null);
    const close = () => {
      if (!contextmenuService.visible.value) {
        return;
      }
      contextmenuService.close();
    };

    onMounted(() => {
      document.addEventListener('click', close);
    });

    onUnmounted(() => {
      document.removeEventListener('click', close);
    });

    return {
      elRef,
      visible: contextmenuService.visible,
      position: computed(() => {
        return {
          left: contextmenuService.position.value.x + 'px',
          top: contextmenuService.position.value.y + 'px',
        };
      }),
    };
  },
});
</script>
<template>
  <Menu
    v-bind="$attrs"
    v-if="visible"
    ref="elRef"
    :style="position"
    class="fixed z-50"
  >
    <slot></slot>
  </Menu>
</template>
