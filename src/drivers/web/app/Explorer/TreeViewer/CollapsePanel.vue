<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Collapse } from 'ant-design-vue';
import { RightOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: { CollapsePanel: Collapse.Panel, RightOutlined },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {
      panelStyle: 'background-color: transparent;border-bottom: 0',
      panelRef: ref(null),
    };
  },
});
</script>
<template>
  <CollapsePanel :style="panelStyle" :showArrow="false" ref="panelRef">
    <template #header>
      <div class="text-white flex items-center">
        <h1
          class="text-inherit text-sm uppercase my-0 p-2 flex-grow"
          @dragover.prevent
          @drop="$emit('headerDrop')"
        >
          <slot name="icon"></slot><span class="ml-1">{{ title }}</span>
          <RightOutlined
            class="ml-1 transform scale-75"
            :rotate="panelRef?.isActive ? 90 : 0"
          />
        </h1>
        <div class="text-right" @click.stop>
          <slot name="extra"></slot>
        </div>
      </div>
    </template>
    <template #default>
      <slot></slot>
    </template>
  </CollapsePanel>
</template>
<style scoped>
:deep(.ant-collapse-header) {
  padding: 0 !important;
}

:deep(.ant-collapse-content-box) {
  padding: 0 !important;
}
</style>
