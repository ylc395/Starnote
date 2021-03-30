<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Menu } from 'ant-design-vue';
import {
  SettingService,
  token as settingToken,
} from 'domain/service/SettingService';
import { CheckSquareTwoTone } from '@ant-design/icons-vue';
import { computed } from '@vue/reactivity';
import { partial } from 'lodash';

export default defineComponent({
  components: {
    CheckSquareTwoTone,
    MenuItem: Menu.Item,
    Menu,
  },
  setup() {
    const {
      setting: { get: getSetting, toggle },
    } = inject<SettingService>(settingToken)!;
    const toggleValue = partial(toggle, 'noteListFields');

    return {
      options: [
        { key: 'userModifiedAt', title: '修改时间' },
        { key: 'userCreatedAt', title: '创建时间' },
      ],
      fields: computed(() => getSetting('noteListFields')),
      toggleValue,
    };
  },
});
</script>
<template>
  <Menu>
    <MenuItem
      @click="toggleValue($event.key)"
      v-for="option of options"
      :key="option.key"
    >
      <CheckSquareTwoTone
        :class="{ invisible: !fields.includes(option.key) }"
      />{{ option.title }}
    </MenuItem>
  </Menu>
</template>
