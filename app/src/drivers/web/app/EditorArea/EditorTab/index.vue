<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tabs } from 'ant-design-vue';
import { token, EditorService } from 'domain/service/EditorService';
import { EMPTY_TITLE } from 'domain/entity';
import { FileOutlined, FolderOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: { Tabs, TabPane: Tabs.TabPane, FileOutlined, FolderOutlined },
  setup() {
    const {
      editorManager: {
        editors,
        activeEditor,
        closeEditorById,
        setActiveEditor,
      },
    } = inject<EditorService>(token)!;

    return {
      editors,
      activeEditor,
      closeEditorById,
      setActiveEditor,
      EMPTY_TITLE,
    };
  },
});
</script>
<template>
  <Tabs
    type="editable-card"
    hide-add
    :activeKey="activeEditor?.id"
    @edit="closeEditorById"
    @change="setActiveEditor"
  >
    <TabPane v-for="editor of editors" :key="editor.id" :closable="true">
      <template #tab>
        <FolderOutlined v-if="editor.isIndexNote" />
        <FileOutlined v-else />
        <span>
          {{ editor.title.value || EMPTY_TITLE }}
        </span>
      </template>
      <slot :editor="editor"></slot>
    </TabPane>
  </Tabs>
</template>
<style scoped>
:deep(.ant-tabs-bar) {
  margin-bottom: 0;
}

:deep(.ant-tabs-content) {
  height: calc(100% - 40px); /* 40px is the height of tab bar */
}

:deep(.ant-tabs-tabpane-active) {
  height: 100%;
}
</style>
