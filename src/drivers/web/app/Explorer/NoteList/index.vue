<script lang="ts">
import { defineComponent, inject, computed } from 'vue';
import { List, Button, Input } from 'ant-design-vue';
import {
  FileAddOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';

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
  },
  setup() {
    const {
      itemTree: { historyBack, isEmptyHistory },
    } = inject<ItemTreeService>(ItemTreeToken)!;
    const { noteList, createNoteAndOpenInEditor } = inject<NoteListService>(
      noteListToken,
    )!;
    const { openInEditor, isActive } = inject<EditorService>(editorToken)!;

    const { open: openContextmenu } = useCommonContextmenu<Note>();
    const { handleDragstart } = useDraggable();

    return {
      EMPTY_TITLE,
      notes: computed(() => noteList.value.notes.value),
      historyBack,
      newNoteDisabled: computed(() => noteList.value.newNoteDisabled.value),
      isEmptyHistory,
      openInEditor,
      isActive,
      openContextmenu,
      handleDragstart,
      createNoteAndOpenInEditor: () => {
        createNoteAndOpenInEditor(noteList.value.notebook!, false);
      },
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
        @click="createNoteAndOpenInEditor"
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
  </div>
</template>
