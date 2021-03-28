<script lang="ts">
import { defineComponent } from 'vue';
import { Menu } from 'ant-design-vue';
import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
} from '@ant-design/icons-vue';
import CommonContextmenu from 'drivers/web/components/Contextmenu/index.vue';
import { useContextmenu } from './useContextmenu';

export default defineComponent({
  components: {
    MenuItem: Menu.Item,
    SubMenu: Menu.SubMenu,
    CommonContextmenu,
    FolderAddOutlined,
    FileAddOutlined,
    DeleteOutlined,
    EditOutlined,
    StarOutlined,
  },
  setup() {
    const { type, handleClick, context } = useContextmenu();

    return {
      type,
      handleClick,
      context,
    };
  },
});
</script>
<template>
  <CommonContextmenu @click="handleClick" class="w-36">
    <template v-if="type === 'notebook'">
      <MenuItem key="createNotebook"><FolderAddOutlined />新建笔记本</MenuItem>
      <MenuItem key="createNote"><FileAddOutlined />新建笔记</MenuItem>
      <MenuItem key="createIndexNote" v-if="!context.indexNote.value"
        ><EditOutlined />编写目录笔记</MenuItem
      >
      <MenuItem key="deleteIndexNote" v-else
        ><DeleteOutlined class="text-red-400" />删除目录笔记</MenuItem
      >
      <MenuItem key="rename"><EditOutlined />重命名</MenuItem>
    </template>
    <MenuItem v-if="type === 'note'" key="star"> <StarOutlined />收藏</MenuItem>
    <MenuItem key="delete">
      <DeleteOutlined class="text-red-400" />删除</MenuItem
    >
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
