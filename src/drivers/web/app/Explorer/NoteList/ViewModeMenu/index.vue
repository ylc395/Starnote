<script lang="ts">
import { defineComponent } from 'vue';
import { Menu } from 'ant-design-vue';
import { CheckSquareTwoTone } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    CheckSquareTwoTone,
    MenuItem: Menu.Item,
    Menu,
  },
});
</script>
<template>
  <Menu>
    <MenuItem key="simpleMode"><CheckSquareTwoTone />精简视图</MenuItem>
    <MenuItem key="complicatedMode"><CheckSquareTwoTone />详细视图</MenuItem>
  </Menu>
</template>
