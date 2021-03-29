<script lang="ts">
import { defineComponent } from 'vue';
import { Menu } from 'ant-design-vue';
import { CheckSquareTwoTone } from '@ant-design/icons-vue';
import { useSort } from './useSort';

export default defineComponent({
  components: {
    CheckSquareTwoTone,
    MenuItem: Menu.Item,
    Menu,
    Divider: Menu.Divider,
  },
  setup() {
    const {
      sortOptions,
      sortDirectOptions,
      handleClick,
      currentSortValue,
      currentDirectValue,
    } = useSort();

    return {
      sortOptions,
      sortDirectOptions,
      handleClick,
      currentSortValue,
      currentDirectValue,
    };
  },
});
</script>
<template>
  <Menu>
    <MenuItem
      v-for="option of sortOptions"
      :key="option.key"
      @click="handleClick('sortBy', $event)"
      ><CheckSquareTwoTone
        :class="{
          invisible: currentSortValue !== option.key,
        }"
      />{{ option.title }}</MenuItem
    >
    <Divider />
    <MenuItem
      v-for="option of sortDirectOptions"
      :key="option.key"
      @click="handleClick('direct', $event)"
      ><CheckSquareTwoTone
        :class="{
          invisible: currentDirectValue !== option.key,
        }"
      />{{ option.title }}</MenuItem
    >
  </Menu>
</template>
