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
import {
  RevisionService,
  token as revisionToken,
} from 'domain/service/RevisionService';
import { selfish } from 'utils/helper';

export default defineComponent({
  components: { Explorer, EditorArea },
  setup() {
    provide(itemTreeToken, selfish(new ItemTreeService()));
    provide(editorToken, selfish(new EditorService()));
    provide(settingToken, selfish(new SettingService()));
    provide(starToken, selfish(new StarService()));
    provide(revisionToken, selfish(new RevisionService()));
  },
});
</script>
<template>
  <main class="flex h-screen w-screen">
    <Explorer />
    <EditorArea />
  </main>
</template>
