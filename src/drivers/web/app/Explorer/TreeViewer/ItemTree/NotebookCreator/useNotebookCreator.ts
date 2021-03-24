import { inject, ref, shallowRef, provide, computed } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import { TreeItem } from 'domain/entity';
import {
  NotebookService,
  token as notebookToken,
} from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity/Notebook';

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreator>
> = Symbol();

export function useNotebookCreator() {
  const { createIndexNote, createSubNotebook } = inject<NotebookService>(
    notebookToken,
  )!;
  const isCreating = ref(false);
  const title = ref('');

  let _type = '';
  const _target: Ref<TreeItem | undefined | null> = shallowRef(null);
  const path = computed(() => {
    let node = _target.value;
    const path = [];

    while (Notebook.isA(node)) {
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

  function startCreating(
    target?: Notebook,
    type: 'notebook' | 'indexNote' = 'notebook',
  ) {
    _type = type;
    _target.value = target;

    isCreating.value = true;
  }

  function stopCreating(isConfirmed: boolean) {
    if (isConfirmed && _type === 'notebook') {
      createSubNotebook(title.value, _target.value as Notebook);
    }

    if (isConfirmed && _type === 'indexNote') {
      createIndexNote(title.value, _target.value as Notebook);
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
