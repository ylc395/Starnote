<script lang="ts">
import { defineComponent, inject } from 'vue';
import { List, Button, Input } from 'ant-design-vue';
import { NoteListService } from 'domain/service/NoteListService';
import { EMPTY_TITLE } from 'domain/constant';
import Contextmenu from '../Contextmenu/contextmenu.component.vue';
import { ContextmenuService } from '../Contextmenu/contextmenu.service';
import {
  NotebookTreeService,
  token as notebookTreeToken,
} from 'domain/service/NotebookTreeService';
import {
  FileAddOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import { partial } from 'lodash';

export default defineComponent({
  components: {
    FileAddOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
    Button,
    List,
    AInput: Input,
    ListItem: List.Item,
    Contextmenu,
  },
  setup() {
    const notebookTreeService = inject<NotebookTreeService>(notebookTreeToken)!;
    const noteListService = new NoteListService(notebookTreeService);
    const {
      openContextmenu,
      token: contextmenuToken,
    } = ContextmenuService.setup();

    const { historyBack, isEmptyHistory } = notebookTreeService;
    const {
      openEditor,
      createAndOpenEditor,
      isEditing,
    } = inject<EditorService>(editorToken)!;
    const { newNoteDisabled, notes } = noteListService;

    return {
      EMPTY_TITLE,
      notes,
      historyBack,
      newNoteDisabled,
      isEmptyHistory,
      openEditor,
      isEditing,
      contextmenuToken,
      openContextmenu,
      createAndOpenEditor: partial(createAndOpenEditor, noteListService, false),
    };
  },
});
</script>
<template>
  <div class="min-h-screen bg-gray-100 w-60">
    <div class="p-2">
      <Button
        @click="historyBack"
        :disabled="isEmptyHistory"
        type="primary"
        size="small"
        class="rounded-md mr-2"
      >
        <template #icon>
          <ArrowLeftOutlined />
        </template>
      </Button>
      <Button
        type="primary"
        :disabled="newNoteDisabled"
        size="small"
        @click="createAndOpenEditor"
        class="rounded-md mr-2"
      >
        <template #icon>
          <FileAddOutlined />
        </template>
      </Button>
      <AInput placeholder="全局搜索" class="w-40">
        <template #prefix><SearchOutlined /></template>
      </AInput>
    </div>
    <List :dataSource="notes" class="border-none px-2">
      <template #renderItem="{ item }">
        <listItem
          @click="openEditor(item)"
          @contextmenu="openContextmenu({ event: $event, item })"
          class="border-b-2 border-gray-200 px-3 hover:bg-blue-100"
          :class="{ 'bg-gray-200': isEditing(item.id).value }"
        >
          {{ item.title.value || EMPTY_TITLE }}
        </listItem>
      </template>
    </List>
    <Contextmenu :token="contextmenuToken" />
  </div>
</template>
