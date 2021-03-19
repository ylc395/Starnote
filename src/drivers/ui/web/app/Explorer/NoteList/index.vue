<script lang="ts">
import { defineComponent, inject } from 'vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { NoteListService } from 'domain/service/NoteListService';
import { NoteService } from 'domain/service/NoteService';
import { List, Button, Input } from 'ant-design-vue';
import {
  FileAddOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    FileAddOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
    Button,
    List,
    AInput: Input,
    ListItem: List.Item,
  },
  setup() {
    const notebookTreeService = inject<NotebookTreeService>(token)!;
    const noteListService = new NoteListService(notebookTreeService);

    const noteService = new NoteService();

    return {
      notes: noteListService.notes,
      goBack: notebookTreeService.historyBack,
      createNote: () => {
        const notebook = noteListService.notebook.value;

        if (notebook && !notebook.isRoot) {
          noteService.createEmptyNote(notebook);
        }
      },
    };
  },
});
</script>
<template>
  <div class="min-h-screen bg-gray-100 w-60">
    <div class="p-2">
      <Button
        @click="goBack"
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
        size="small"
        @click="createNote"
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
        <listItem class="border-b-2 border-gray-200 px-3">
          {{ item.title.value }}
        </listItem>
      </template>
    </List>
  </div>
</template>
