<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tabs } from 'ant-design-vue';
import { token, EditorService } from 'domain/service/EditorService';
import { EMPTY_TITLE } from 'domain/constant';

export default defineComponent({
  components: { Tabs, TabPane: Tabs.TabPane },
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
    <TabPane
      v-for="editor of editors"
      :key="editor.id"
      :closable="true"
      :tab="editor.title.value || EMPTY_TITLE"
    />
  </Tabs>
</template>
