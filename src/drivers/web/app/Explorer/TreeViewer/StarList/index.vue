<script lang="ts">
import { defineComponent, inject } from 'vue';
import { StarOutlined, FileOutlined } from '@ant-design/icons-vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import DraggableList from 'vuedraggable';

export default defineComponent({
  components: {
    StarOutlined,
    FileOutlined,
    DraggableList,
  },
  setup() {
    const { stars } = inject<ItemTreeService>(itemTreeToken)!;
    const {
      editorManager: { isActive, openInEditor },
    } = inject<EditorService>(editorToken)!;
    return { stars, isActive, openInEditor };
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
      v-model="stars"
      itemKey="id"
      class="pl-0 text-gray-200 mt-2"
    >
      <template #item="{ element }">
        <li
          class="list-none pl-5 py-2"
          :class="{ 'bg-gray-900': isActive(element.entity.value).value }"
          @click="openInEditor(element.entity.value)"
        >
          <FileOutlined class="mr-1" />
          {{ element.entity.value.title.value }}
        </li>
      </template>
    </DraggableList>
  </div>
</template>
