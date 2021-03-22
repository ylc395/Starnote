import { NotebookService } from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity/Notebook';
import {
  ItemTreeService,
  token as notebookTreeToken,
} from 'domain/service/ItemTreeService';
import { inject, ref, provide, computed, shallowRef } from 'vue';
import type { InjectionKey, Ref } from 'vue';

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreator>
> = Symbol();

export function useNotebookCreator() {
  const notebookService: Ref<NotebookService | null> = shallowRef(null);
  const itemTreeService = inject<ItemTreeService>(notebookTreeToken)!;
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

  function startCreating(target?: Notebook) {
    notebookService.value = new NotebookService(itemTreeService, target);
    isCreating.value = true;
  }

  function stopCreating(isConfirmed: boolean) {
    if (isConfirmed) {
      notebookService!.value!.createSubNotebook(title.value);
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
