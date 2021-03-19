<script lang="ts">
import { defineComponent } from 'vue';
import { List, Button, Input } from 'ant-design-vue';
import {
  FileAddOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';
import { useNoteList } from './useNoteList';

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
    const {
      notes,
      goBack,
      disabledNewNote,
      disabledGoBack,
      createNote,
    } = useNoteList();

    return { notes, goBack, disabledNewNote, disabledGoBack, createNote };
  },
});
</script>
<template>
  <div class="min-h-screen bg-gray-100 w-60">
    <div class="p-2">
      <Button
        @click="goBack"
        :disabled="disabledGoBack"
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
        :disabled="disabledNewNote"
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
        <listItem class="border-b-2 border-gray-200 px-3 hover:bg-gray-200">
          {{ item.title.value }}
        </listItem>
      </template>
    </List>
  </div>
</template>
