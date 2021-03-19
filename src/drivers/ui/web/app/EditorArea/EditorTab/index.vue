<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Tabs } from 'ant-design-vue';
import { token, EditorService } from 'domain/service/EditorService';

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
      :tab="editor.title.value"
    />
  </Tabs>
</template>
