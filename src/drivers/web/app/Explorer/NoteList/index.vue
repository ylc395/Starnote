<script lang="ts">
import { defineComponent, inject } from 'vue';
import { List, Button, Input } from 'ant-design-vue';
import {
  FileAddOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';
import Resizable from 'vue-resizable';

import type { Note } from 'domain/entity';
import { EMPTY_TITLE } from 'domain/constant';
import {
  NoteListService,
  token as noteListToken,
} from 'domain/service/NoteListService';
import {
  ItemTreeService,
  token as ItemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';

import Contextmenu from '../Contextmenu/index.vue';
import { useContextmenu as useCommonContextmenu } from 'drivers/web/components/Contextmenu/useContextmenu';
import { useDraggable } from './useDraggable';

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
    Resizable,
  },
  setup() {
    const {
      itemTree: { historyBack, isEmptyHistory },
      createNote,
    } = inject<ItemTreeService>(ItemTreeToken)!;

    const {
      noteList: { notes, newNoteDisabled },
    } = inject<NoteListService>(noteListToken)!;

    const {
      openInEditor,
      editorManager: { isActive },
    } = inject<EditorService>(editorToken)!;

    const { open: openContextmenu } = useCommonContextmenu<Note>();
    const { handleDragstart } = useDraggable();

    return {
      EMPTY_TITLE,
      notes,
      historyBack,
      newNoteDisabled,
      isEmptyHistory,
      openInEditor,
      isActive,
      openContextmenu,
      handleDragstart,
      createNote,
    };
  },
});
</script>
<template>
  <Resizable
    width="15rem"
    class="h-full bg-gray-100 flex flex-col"
    :disableAttributes="['h']"
    :active="['r']"
  >
    <div class="py-2 px-3 flex items-center">
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
        @click="createNote()"
        class="rounded-md mr-2"
      >
        <template #icon>
          <FileAddOutlined />
        </template>
      </Button>
      <AInput placeholder="全局搜索" class="w-40 flex-grow">
        <template #prefix><SearchOutlined /></template>
      </AInput>
    </div>
    <List :dataSource="notes" class="border-none px-2 overflow-y-auto">
      <template #renderItem="{ item }">
        <listItem
          draggable="true"
          @dragstart="handleDragstart($event, item)"
          @click="openInEditor(item)"
          @contextmenu="openContextmenu($event, item)"
          :class="{
            'bg-gray-200': isActive(item.id).value,
            'bg-blue-50': item.withContextmenu.value,
          }"
          class="border-b-2 border-gray-200 px-3 hover:bg-blue-100"
        >
          {{ item.title.value || EMPTY_TITLE }}
        </listItem>
      </template>
    </List>
    <Contextmenu />
  </Resizable>
</template>
