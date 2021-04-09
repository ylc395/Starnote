<script lang="ts">
import { defineComponent, inject } from 'vue';
import {
  StarOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { StarService, token as starToken } from 'domain/service/StarService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import DraggableList from 'vuedraggable';

export default defineComponent({
  components: {
    StarOutlined,
    CloseOutlined,
    FileOutlined,
    DraggableList,
  },
  setup() {
    const {
      sortedStars: stars,
      setSortOrders,
      removeStars,
    } = inject<StarService>(starToken)!;

    const {
      editorManager: { isActive },
      openInEditor,
    } = inject<EditorService>(editorToken)!;

    return { stars, isActive, openInEditor, setSortOrders, removeStars };
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
    <DraggableList
      tag="ol"
      :modelValue="stars"
      ghostClass="sorting"
      @update:modelValue="setSortOrders"
      itemKey="id"
      class="pl-0 text-gray-200 mt-2"
    >
      <template #item="{ element }">
        <li
          class="group pl-5 py-2 relative"
          :class="{ 'bg-gray-900': isActive(element.entity.value).value }"
          @click="openInEditor(element.entity.value)"
        >
          <FileOutlined class="mr-1" />
          {{ element.entityName.value }}
          <button
            class="group-hover:visible absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer invisible"
          >
            <CloseOutlined @click.stop="removeStars(element)" />
          </button>
        </li>
      </template>
    </DraggableList>
  </div>
</template>
<style scoped>
:deep(.sorting) {
  opacity: 0.5;
  background: #5c5c5c;
}
</style>
