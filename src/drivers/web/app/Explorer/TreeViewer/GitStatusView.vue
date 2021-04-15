<script lang="ts">
import { defineComponent, inject } from 'vue';
import {
  BranchesOutlined,
  FolderOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { Collapse } from 'ant-design-vue';
import {
  RevisionService,
  token as revisionToken,
} from 'domain/service/RevisionService';
import GitStatusMark from './GitStatusMark.vue';

export default defineComponent({
  components: {
    BranchesOutlined,
    GitStatusMark,
    FolderOutlined,
    FileOutlined,
    CollapsePanel: Collapse.Panel,
  },
  setup() {
    const { changedNotes } = inject<RevisionService>(revisionToken)!;
    return { changedNotes };
  },
});
</script>
<template>
  <CollapsePanel>
    <template #header>
      <div class="tree-viewer-header">
        <h1 class="tree-viewer-title">
          <BranchesOutlined class="tree-viewer-icon" />
          Git
        </h1>
      </div>
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
