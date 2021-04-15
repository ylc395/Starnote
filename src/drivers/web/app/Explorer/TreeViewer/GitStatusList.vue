<script lang="ts">
import { defineComponent, inject } from 'vue';
import {
  BranchesOutlined,
  FolderOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import {
  RevisionService,
  token as revisionToken,
} from 'domain/service/RevisionService';
import GitStatusMark from './GitStatusMark.vue';
import CollapsePanel from './CollapsePanel.vue';

export default defineComponent({
  components: {
    BranchesOutlined,
    GitStatusMark,
    FolderOutlined,
    FileOutlined,
    CollapsePanel,
  },
  setup() {
    const { changedNotes } = inject<RevisionService>(revisionToken)!;
    return { changedNotes };
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
        :key="note.id"
        class="flex justify-between tree-viewer-list-item"
      >
        <div>
          <FolderOutlined v-if="note.isIndexNote" />
          <FileOutlined v-else />
          <span class="ml-2">{{ note.actualTitle.value }}</span>
        </div>
        <GitStatusMark :mark="note.gitStatus.value" />
      </li>
    </ul>
  </CollapsePanel>
</template>
