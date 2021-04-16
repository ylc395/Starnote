<script lang="ts">
import { defineComponent, inject } from 'vue';
import {
  BranchesOutlined,
  FolderOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';
import {
  RevisionService,
  token as revisionToken,
} from 'domain/service/RevisionService';
import GitStatusMark from './GitStatusMark.vue';
import CollapsePanel from './CollapsePanel.vue';

export default defineComponent({
  components: {
    Button,
    BranchesOutlined,
    GitStatusMark,
    FolderOutlined,
    FileOutlined,
    CollapsePanel,
  },
  setup() {
    const { changedNotes, commit } = inject<RevisionService>(revisionToken)!;

    return {
      changedNotes,
      commit,
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
        :key="note.id"
        class="flex justify-between tree-viewer-list-item"
      >
        <span>
          <FolderOutlined v-if="note.isIndexNote" />
          <FileOutlined v-else />
          <span class="ml-2">{{ note.actualTitle.value }}</span>
        </span>
        <GitStatusMark :mark="note.gitStatus.value" />
      </li>
    </ul>
    <Button
      type="primary"
      v-if="changedNotes.length > 0"
      class="w-5/6 mx-auto mt-2 block"
      @click="commit"
    >
      提交
    </Button>
  </CollapsePanel>
</template>
