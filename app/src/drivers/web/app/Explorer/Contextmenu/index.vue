<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Menu } from 'ant-design-vue';
import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons-vue';
import CommonContextmenu from 'drivers/web/components/Contextmenu/index.vue';
import SortMenu from '../SortMenu/index.vue';
import { token } from './useContextmenu';

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
    SortAscendingOutlined,
    SortMenu,
  },
  setup() {
    const { type, handleClick, isWithIndexNote, isStar, showSortMenu } = inject(
      token,
    )!;

    return {
      type,
      isStar,
      handleClick,
      isWithIndexNote,
      showSortMenu,
    };
  },
});
</script>
<template>
  <CommonContextmenu @click="handleClick" class="w-36">
    <template v-if="type === 'notebook'">
      <MenuItem key="createNotebook"><FolderAddOutlined />新建笔记本</MenuItem>
      <MenuItem key="createNote"><FileAddOutlined />新建笔记</MenuItem>
      <MenuItem key="createIndexNote" v-if="!isWithIndexNote"
        ><EditOutlined />编写目录笔记</MenuItem
      >
      <MenuItem key="deleteIndexNote" v-else
        ><DeleteOutlined class="text-red-400" />删除目录笔记</MenuItem
      >
      <MenuItem key="rename"><EditOutlined />重命名</MenuItem>
    </template>
    <template v-if="type === 'note'">
      <MenuItem v-if="!isStar" key="star"> <StarOutlined />收藏</MenuItem>
      <MenuItem v-else key="removeStar"> <StarOutlined />取消收藏</MenuItem>
    </template>
    <MenuItem key="delete">
      <DeleteOutlined class="text-red-400" />删除</MenuItem
    >
    <SubMenu v-if="type === 'notebook' && showSortMenu">
      <template #title>
        <SortAscendingOutlined />
        排序设置
      </template>
      <SortMenu />
    </SubMenu>
  </CommonContextmenu>
</template>
