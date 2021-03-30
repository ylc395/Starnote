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
import { selfish } from 'utils/index';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    const itemTreeService = selfish(new ItemTreeService());
    const editorService = selfish(new EditorService(itemTreeService));
    const settingService = selfish(new SettingService());

    provide(itemTreeToken, itemTreeService);
    provide(editorToken, editorService);
    provide(settingToken, settingService);
  },
});
</script>
<template>
  <main class="flex h-screen">
    <Explorer />
    <EditorArea />
  </main>
</template>
