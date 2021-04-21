<script lang="ts">
import { defineComponent, inject, computed } from 'vue';
import {
  BranchesOutlined,
  FolderOutlined,
  FileOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';
import {
  RevisionService,
  token as revisionToken,
} from 'domain/service/RevisionService';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import { INDEX_NOTE_TITLE, ItemTree, Note, NOTE_SUFFIX } from 'domain/entity';
import Mark from './GitStatusMark.vue';
import CollapsePanel from './CollapsePanel.vue';

export default defineComponent({
  components: {
    Button,
    BranchesOutlined,
    Mark,
    FolderOutlined,
    FileOutlined,
    CollapsePanel,
    RedoOutlined,
  },
  setup() {
    const {
      changedNotes,
      commit,
      restore,
      isRefreshing,
    } = inject<RevisionService>(revisionToken)!;
    const {
      editorManager: { isActive },
      openInEditor,
    } = inject<EditorService>(editorToken)!;

    return {
      changedNotes: computed(() =>
        changedNotes.value.map((item) => ({
          isNote: Note.isA(item),
          item,
          path: Note.isA(item) ? item.getPath() : item.file,
          title: Note.isA(item)
            ? item.actualTitle.value
            : ItemTree.getTitleWithoutSuffix(item.file),
          status: Note.isA(item) ? item.gitStatus.value : item.status,
          isIndexNote: Note.isA(item)
            ? item.isIndexNote
            : item.file.endsWith(`${INDEX_NOTE_TITLE}${NOTE_SUFFIX}`),
        })),
      ),
      openInEditor(item: unknown) {
        if (Note.isA(item)) {
          openInEditor(item);
        }
      },
      commit,
      isActive,
      restore,
      isRefreshing,
    };
  },
});
</script>
<template>
  <CollapsePanel title="Git">
    <template #icon>
      <BranchesOutlined />
    </template>
    <ul class="tree-viewer-list">
      <li
        v-for="note of changedNotes"
        :key="note.path"
        class="flex justify-between tree-viewer-list-item"
        :class="{
          'cursor-pointer': note.isNote,
          'bg-gray-900': note.isNote && isActive(note.item).value,
        }"
        @click="openInEditor(note.item)"
      >
        <span>
          <FolderOutlined v-if="note.isIndexNote" />
          <FileOutlined v-else />
          <span class="ml-2">{{ note.title }}</span>
        </span>
        <span>
          <RedoOutlined
            v-if="!isRefreshing"
            @click.stop="restore(note.path)"
            class="mr-2"
          />
          <Mark :mark="note.status" />
        </span>
      </li>
    </ul>
    <Button
      type="primary"
      v-if="changedNotes.length > 0"
      class="w-5/6 mx-auto mt-2 block"
      :disabled="isRefreshing"
      @click="commit"
    >
      提交修订
    </Button>
  </CollapsePanel>
</template>
