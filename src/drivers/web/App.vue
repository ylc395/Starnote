<script lang="ts">
import { defineComponent, provide } from '@vue/runtime-core';
import Explorer from './app/Explorer/index.vue';
import EditorArea from './app/EditorArea/index.vue';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  SettingService,
  token as settingToken,
} from 'domain/service/SettingService';
import { StarService, token as starToken } from 'domain/service/StarService';
import { selfish } from 'utils/index';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    provide(itemTreeToken, selfish(new ItemTreeService()));
    provide(editorToken, selfish(new EditorService()));
    provide(settingToken, selfish(new SettingService()));
    provide(starToken, selfish(new StarService()));
  },
});
</script>
<template>
  <main class="flex">
    <Explorer />
    <EditorArea />
  </main>
</template>
