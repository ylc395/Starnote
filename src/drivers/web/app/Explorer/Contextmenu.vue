<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import { Menu } from 'ant-design-vue';
import CommonContextmenu from 'drivers/web/components/Contextmenu/index.vue';
import {
  useContextmenu,
  token,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from './TreeViewer/NotebookTree/NotebookCreator/useNotebookCreator';
import { Notebook } from 'domain/entity';

export default defineComponent({
  components: {
    MenuItem: Menu.Item,
    SubMenu: Menu.SubMenu,
    CommonContextmenu,
  },
  setup() {
    const { context } = inject<ReturnType<typeof useContextmenu>>(token)!;
    const notebookCreator = inject(notebookCreatorToken, null);

    const handleNotebook = (notebook: Notebook, key: string) => {
      switch (key) {
        case 'createNotebook':
          notebookCreator?.startCreating(notebook);
          break;
        default:
          break;
      }
    };

    return {
      type: computed(() => {
        if (Notebook.isA(context.value)) {
          return 'notebook';
        }

        return 'note';
      }),
      handleClick({ key }: { key: string }) {
        if (Notebook.isA(context.value)) {
          handleNotebook(context.value, key);
        }
      },
    };
  },
});
</script>
<template>
  <CommonContextmenu @click="handleClick">
    <template v-if="type === 'notebook'">
      <MenuItem key="createNotebook">新建笔记本</MenuItem>
      <MenuItem key="createNote">新建笔记</MenuItem>
      <MenuItem key="createIndexNote">编写目录笔记</MenuItem>
    </template>
    <MenuItem key="remove">删除</MenuItem>
    <MenuItem key="rename">重命名</MenuItem>
    <SubMenu title="排序方式" key="sortBy" v-if="type === 'notebook'">
      <MenuItem key="title">按标题</MenuItem>
      <MenuItem key="lastModifiedAt">按修改日期</MenuItem>
      <MenuItem key="createdAt">按创建日期</MenuItem>
      <MenuItem key="custom">手动排序</MenuItem>
    </SubMenu>
    <SubMenu title="升序/降序" key="sortOrder" v-if="type === 'notebook'">
      <MenuItem key="asc">升序</MenuItem>
      <MenuItem key="desc">降序</MenuItem>
    </SubMenu>
  </CommonContextmenu>
</template>
