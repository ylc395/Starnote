<script lang="ts">
import { defineComponent, inject } from 'vue';
import CommonContextmenu from 'drivers/ui/web/components/Contextmenu/index.vue';
import { Menu } from 'ant-design-vue';
import { token } from './useContextmenu';

export default defineComponent({
  components: {
    MenuItem: Menu.Item,
    SubMenu: Menu.SubMenu,
    CommonContextmenu,
  },
  setup() {
    const contextmenuService = inject(token)!;

    return {
      handleClick({ key }: { key: string }) {
        switch (key) {
          case 'createNotebook':
            contextmenuService.createNotebook();
            break;
          default:
            break;
        }
      },
    };
  },
});
</script>
<template>
  <CommonContextmenu @click="handleClick" selectable>
    <MenuItem key="createNotebook">新建笔记本</MenuItem>
    <MenuItem key="createNote">新建笔记</MenuItem>
    <MenuItem key="remove">删除</MenuItem>
    <MenuItem key="rename">重命名</MenuItem>
    <SubMenu title="排序方式" key="sortBy">
      <MenuItem key="title">按标题</MenuItem>
      <MenuItem key="lastModifiedAt">按修改日期</MenuItem>
      <MenuItem key="createdAt">按创建日期</MenuItem>
      <MenuItem key="custom">手动排序</MenuItem>
    </SubMenu>
    <SubMenu title="升序/降序" key="sortOrder">
      <MenuItem key="asc">升序</MenuItem>
      <MenuItem key="desc">降序</MenuItem>
    </SubMenu>
  </CommonContextmenu>
</template>
