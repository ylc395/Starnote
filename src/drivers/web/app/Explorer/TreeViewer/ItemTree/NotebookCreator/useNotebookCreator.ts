import { inject, ref, shallowRef, provide, computed } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import { TreeItem } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { Notebook } from 'domain/entity/Notebook';

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreator>
> = Symbol();

export function useNotebookCreator() {
  const { createSubNotebook } = inject<ItemTreeService>(itemTreeToken)!;
  const isCreating = ref(false);
  const title = ref('');

  const _target: Ref<TreeItem | null> = shallowRef(null);
  const path = computed(() => {
    let node = _target.value;
    const path = [];

    while (Notebook.isA(node)) {
      path.push(node.title.value);
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
    _target.value = target || null;

    isCreating.value = true;
  }

  function stopCreating(isConfirmed: boolean) {
    if (isConfirmed) {
      createSubNotebook(title.value, _target.value as Notebook | null);
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
