<script lang="ts">
import { defineComponent } from 'vue';
import { Menu } from 'ant-design-vue';
import CommonContextmenu from 'drivers/web/components/Contextmenu/index.vue';
import { useContextmenu } from './useContextmenu';

export default defineComponent({
  components: {
    MenuItem: Menu.Item,
    SubMenu: Menu.SubMenu,
    CommonContextmenu,
  },
  setup() {
    const { type, handleClick } = useContextmenu();

    return {
      type,
      handleClick,
    };
  },
});
</script>
<template>
  <CommonContextmenu @click="handleClick" class="w-32">
    <template v-if="type === 'notebook'">
      <SubMenu title="新建笔记本" key="aaa">
        <MenuItem key="createNotebook">笔记本</MenuItem>
        <MenuItem key="createIndexNote">目录笔记</MenuItem>
      </SubMenu>
      <MenuItem key="createNote">新建笔记</MenuItem>
    </template>
    <MenuItem key="remove">删除</MenuItem>
    <MenuItem key="rename">重命名</MenuItem>
    <SubMenu title="排序方式" v-if="type === 'notebook'">
      <MenuItem key="sortByTitle">按标题</MenuItem>
      <MenuItem key="sortByLastModifiedAt">按修改日期</MenuItem>
      <MenuItem key="sortByCreatedAt">按创建日期</MenuItem>
      <MenuItem key="sortByCustom">手动排序</MenuItem>
    </SubMenu>
    <SubMenu title="升序/降序" v-if="type === 'notebook'">
      <MenuItem key="orderAsc">升序</MenuItem>
      <MenuItem key="orderDesc">降序</MenuItem>
    </SubMenu>
  </CommonContextmenu>
</template>
