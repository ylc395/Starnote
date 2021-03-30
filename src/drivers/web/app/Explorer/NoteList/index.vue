<script lang="ts">
import { defineComponent, inject } from 'vue';
import { List, Button, Input, Dropdown } from 'ant-design-vue';
import {
  FileAddOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  CaretDownOutlined,
  BarsOutlined,
} from '@ant-design/icons-vue';
import Resizable from 'vue-resizable';

import type { Note } from 'domain/entity';
import { EMPTY_TITLE } from 'domain/constant';
import { useNoteList } from './useNoteList';

import Contextmenu from '../Contextmenu/index.vue';
import { useContextmenu as useCommonContextmenu } from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as dragToken } from '../useDrag';
import SortMenu from '../SortMenu/index.vue';
import ViewModeMenu from './ViewModeMenu/index.vue';

export default defineComponent({
  components: {
    FileAddOutlined,
    SearchOutlined,
    Button,
    List,
    AInput: Input,
    ListItem: List.Item,
    Contextmenu,
    Resizable,
    SortMenu,
    SortAscendingOutlined,
    CaretDownOutlined,
    BarsOutlined,
    Dropdown,
    ViewModeMenu,
  },
  setup() {
    const {
      notes,
      isInvalidNotebook,
      openInEditor,
      isActive,
      createNote,
    } = useNoteList();
    const { open: openContextmenu } = useCommonContextmenu<Note>();
    const { handleDragstart } = inject(dragToken)!;

    return {
      EMPTY_TITLE,
      notes,
      isInvalidNotebook,
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
    :minWidth="200"
    class="h-full bg-gray-50 flex flex-col border-r border-0 border-solid border-gray-300"
    :disableAttributes="['h']"
    :active="['r']"
  >
    <div class="py-2 px-3 flex items-center">
      <Button
        type="primary"
        :disabled="isInvalidNotebook"
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
    <div
      v-if="!isInvalidNotebook"
      class="px-3 border-gray-300 bg-gray-100 border-t border-b border-0 border-solid"
    >
      <Dropdown :trigger="['click']" class="mr-2" transitionName="none">
        <template #overlay>
          <SortMenu />
        </template>
        <button class="border-0 bg-transparent p-0 focus:outline-none">
          <SortAscendingOutlined />
          <CaretDownOutlined class="scale-75 transform" />
        </button>
      </Dropdown>
      <Dropdown :trigger="['click']" transitionName="none">
        <template #overlay>
          <ViewModeMenu />
        </template>
        <button class="border-0 bg-transparent p-0 focus:outline-none">
          <BarsOutlined />
          <CaretDownOutlined class="scale-75 transform" />
        </button>
      </Dropdown>
    </div>
    <List :dataSource="notes" class="border-none px-2 overflow-y-auto mt-2">
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
