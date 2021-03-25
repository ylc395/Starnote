<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tabs } from 'ant-design-vue';
import { token, EditorService } from 'domain/service/EditorService';
import { EMPTY_TITLE } from 'domain/constant';
import { FileOutlined, FolderOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: { Tabs, TabPane: Tabs.TabPane, FileOutlined, FolderOutlined },
  setup() {
    const {
      editors,
      activeEditor,
      closeEditorById,
      setActiveEditor,
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
        <FolderOutlined v-if="editor.note.value.isIndexNote" />
        <FileOutlined v-else />
        <span>
          {{
            (editor.note.value.isIndexNote
              ? editor.notebookTitle.value
              : editor.title.value) || EMPTY_TITLE
          }}
        </span>
      </template>
    </TabPane>
  </Tabs>
</template>
