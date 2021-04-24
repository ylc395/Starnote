<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Button, Input, Dropdown } from 'ant-design-vue';
import DraggableList from 'vuedraggable';
import {
  FileAddOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  CaretDownOutlined,
  BarsOutlined,
  StarFilled,
} from '@ant-design/icons-vue';
import Resizable from 'vue-resizable';

import { Note, EMPTY_TITLE } from 'domain/entity';
import { StarService, token as starToken } from 'domain/service/StarService';
import { useNoteList } from './useNoteList';

import Contextmenu from '../../Contextmenu/index.vue';
import { useContextmenu } from '../../Contextmenu/useContextmenu';
import { token as dragToken } from '../../useDrag';
import SortMenu from '../../SortMenu/index.vue';
import ViewModeMenu from './ViewModeMenu.vue';
import GitStatusMark from '../GitStatusMark.vue';

export default defineComponent({
  components: {
    FileAddOutlined,
    SearchOutlined,
    Button,
    DraggableList,
    AInput: Input,
    Contextmenu,
    Resizable,
    SortMenu,
    SortAscendingOutlined,
    CaretDownOutlined,
    BarsOutlined,
    StarFilled,
    Dropdown,
    ViewModeMenu,
    GitStatusMark,
  },
  setup() {
    const {
      notes,
      isInvalidNotebook,
      openInEditor,
      isActive,
      createNote,
      setSortOrders,
      sortable,
      showingFields,
    } = useNoteList();
    const { open: openContextmenu } = useContextmenu<Note>();
    const { handleDragstart } = inject(dragToken)!;
    const { isStar } = inject<StarService>(starToken)!;

    return {
      EMPTY_TITLE,
      notes,
      isInvalidNotebook,
      openInEditor,
      isActive,
      openContextmenu,
      handleDragstart,
      createNote,
      setSortOrders,
      sortable,
      showingFields,
      isStar,
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
        <button class="note-list-button">
          <SortAscendingOutlined />
          <CaretDownOutlined class="scale-75 transform" />
        </button>
      </Dropdown>
      <Dropdown :trigger="['click']" transitionName="none">
        <template #overlay>
          <ViewModeMenu />
        </template>
        <button class="note-list-button">
          <BarsOutlined />
          <CaretDownOutlined class="scale-75 transform" />
        </button>
      </Dropdown>
    </div>
    <DraggableList
      tag="ol"
      :modelValue="notes"
      :sort="sortable"
      ghostClass="sorting"
      itemKey="id"
      class="border-none px-2 overflow-y-auto mt-2 divide-solid divide-y-2 divide-gray-200"
      @update:modelValue="setSortOrders"
    >
      <template #item="{ element }">
        <li
          draggable="true"
          @dragstart="handleDragstart($event, element)"
          @click="openInEditor(element)"
          @contextmenu="openContextmenu($event, element)"
          :class="{
            'bg-gray-200': isActive(element).value,
            'bg-blue-50': element.withContextmenu.value,
          }"
          class="px-3 py-3 border-0 hover:bg-blue-100 flex flex-col"
        >
          <div
            :class="{ 'mb-2': showingFields.length > 0 }"
            class="flex justify-between items-center"
          >
            <span>{{ element.title.value || EMPTY_TITLE }}</span>
            <div>
              <GitStatusMark :mark="element.gitStatus.value" />
              <StarFilled
                :class="{ invisible: !isStar(element).value }"
                class="text-yellow-300 ml-2"
              />
            </div>
          </div>
          <time
            v-if="showingFields.includes('userCreatedAt')"
            class="note-list-time"
          >
            创建于 {{ element.userCreatedAt.value.format('YYYY-MM-DD HH:mm') }}
          </time>
          <time
            v-if="showingFields.includes('userModifiedAt')"
            class="note-list-time"
          >
            更新于 {{ element.userModifiedAt.value.format('YYYY-MM-DD HH:mm') }}
          </time>
        </li>
      </template>
    </DraggableList>
    <Contextmenu />
  </Resizable>
</template>
<style scoped>
:deep(.sorting) {
  opacity: 0.5;
  background: #c8ebfb;
}

@layer components {
  :deep(.note-list-button) {
    @apply p-0;
  }

  :deep(.note-list-time) {
    @apply text-gray-400 text-xs;
  }
}
</style>
