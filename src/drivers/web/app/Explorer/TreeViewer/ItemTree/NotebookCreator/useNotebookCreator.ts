import { NotebookService } from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity/Notebook';
import {
  ItemTreeService,
  token as ItemTreeToken,
} from 'domain/service/ItemTreeService';
import { inject, ref, provide, computed, shallowRef } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import {
  EditorService,
  token as editorToken,
} from 'domain/service/EditorService';

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreator>
> = Symbol();

export function useNotebookCreator() {
  const notebookService: Ref<NotebookService | null> = shallowRef(null);
  const itemTreeService = inject<ItemTreeService>(ItemTreeToken)!;
  const editorService = inject<EditorService>(editorToken)!;
  const isCreating = ref(false);
  const title = ref('');
  const path = computed(() => {
    let node = notebookService.value?.notebook;
    const path = [];
    while (node) {
      if (!node.isRoot) {
        path.push(node.title.value);
      }
      node = node.getParent();
    }

    return path.reverse();
  });

  const handleEnter = () => {
    if (!title.value) {
      return;
    }
    stopCreating(true);
  };

  let _type = '';

  function startCreating(
    target?: Notebook,
    type: 'notebook' | 'indexNote' = 'notebook',
  ) {
    _type = type;
    notebookService.value = new NotebookService(itemTreeService, target);
    isCreating.value = true;
  }

  function stopCreating(isConfirmed: boolean) {
    if (isConfirmed && _type === 'notebook') {
      notebookService!.value!.createSubNotebook(title.value);
    }

    if (isConfirmed && _type === 'indexNote') {
      notebookService!.value!.createIndexNote(title.value, editorService);
    }

    title.value = '';
    isCreating.value = false;
  }

  const service = {
    startCreating,
    stopCreating,
    isCreating,
    title,
    path,
    handleEnter,
  };
  provide(token, service);

  return service;
}
