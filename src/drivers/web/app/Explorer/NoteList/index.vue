<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Button, Input, Dropdown } from 'ant-design-vue';
import DraggableList from 'vuedraggable';
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
    DraggableList,
    AInput: Input,
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
      setSortOrders,
      sortable,
    } = useNoteList();
    const { open: openContextmenu } = useCommonContextmenu<Note>();
    const { handleDragstart } = inject(dragToken)!;
    const sorting = ref(false);
    const handleSortStart = () => (sorting.value = true);
    const handleSortEnd = () => (sorting.value = false);

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
      sorting,
      handleSortStart,
      handleSortEnd,
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
    <DraggableList
      tag="ol"
      :modelValue="notes"
      :sort="sortable"
      ghostClass="sorting"
      itemKey="id"
      class="border-none px-2 overflow-y-auto mt-2 divide-solid divide-y-2 divide-gray-200"
      @update:modelValue="setSortOrders"
      @start="handleSortStart"
      @end="handleSortEnd"
    >
      <template #item="{ element }">
        <li
          draggable="true"
          @dragstart="handleDragstart($event, element)"
          @click="openInEditor(element)"
          @contextmenu="openContextmenu($event, element)"
          :class="{
            'bg-gray-200': isActive(element.id).value,
            'bg-blue-50': element.withContextmenu.value,
          }"
          class="list-none px-3 py-3 border-0 hover:bg-blue-100"
        >
          {{ element.title.value || EMPTY_TITLE }}
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
</style>
