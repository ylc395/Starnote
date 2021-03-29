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
      allowDirect,
    } = useSort();

    return {
      sortOptions,
      sortDirectOptions,
      handleClick,
      currentSortValue,
      currentDirectValue,
      allowDirect,
    };
  },
});
</script>
<template>
  <Menu>
    <MenuItem
      v-for="option of sortOptions"
      :key="option.key"
      :disabled="currentSortValue === option.key"
      @click="handleClick('sortBy', $event)"
      ><CheckSquareTwoTone
        :class="{
          invisible: currentSortValue !== option.key,
        }"
      />{{ option.title }}</MenuItem
    >
    <template v-if="allowDirect">
      <Divider />
      <MenuItem
        v-for="option of sortDirectOptions"
        :key="option.key"
        :disabled="currentDirectValue === option.key"
        @click="handleClick('direct', $event)"
      >
        <CheckSquareTwoTone
          :class="{ invisible: currentDirectValue !== option.key }"
        />
        {{ option.title }}
      </MenuItem>
    </template>
  </Menu>
</template>
