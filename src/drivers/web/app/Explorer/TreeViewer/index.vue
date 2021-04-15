<script lang="ts">
import { defineComponent, ref } from 'vue';
import Resizable from 'vue-resizable';
import { Collapse } from 'ant-design-vue';
import ItemTree from './ItemTree/index.vue';
import StarList from './StarList.vue';
import NoteList from './NoteList/index.vue';
import GitStatusView from './GitStatusView.vue';

export default defineComponent({
  components: {
    Collapse,
    StarList,
    ItemTree,
    NoteList,
    Resizable,
    GitStatusView,
  },
  setup() {
    return {
      activePanels: ref(['1', '2', '3']),
      panelStyle: 'background-color: transparent;border-bottom: 0',
    };
  },
});
</script>
<template>
  <div class="flex h-screen">
    <Resizable
      class="tree-viewer h-full pt-4"
      :active="['r']"
      :disableAttributes="['h']"
      :minWidth="180"
      width="15rem"
    >
      <Collapse
        v-model:activeKey="activePanels"
        class="bg-transparent"
        :bordered="false"
      >
        <StarList key="1" :style="panelStyle" :showArrow="false" />
        <ItemTree key="2" :style="panelStyle" :showArrow="false" />
        <GitStatusView key="3" :style="panelStyle" :showArrow="false" />
      </Collapse>
    </Resizable>
    <NoteList />
  </div>
</template>
<style scoped>
.tree-viewer {
  background-color: rgba(55, 65, 81);
}

@layer components {
  :deep(.tree-viewer-list) {
    @apply pl-0 text-gray-200 my-0;
  }

  :deep(.tree-viewer-list-item) {
    @apply pl-5 p-2;
  }
}
</style>
