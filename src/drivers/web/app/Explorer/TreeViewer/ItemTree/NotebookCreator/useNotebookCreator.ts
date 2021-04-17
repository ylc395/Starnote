import { inject, ref, shallowRef, provide, computed } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { EntityTypes, Notebook, TITLE_STATUS_TEXT } from 'domain/entity';

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreator>
> = Symbol();

export function useNotebookCreator() {
  const {
    itemTree: { root, createSubNotebook },
  } = inject<ItemTreeService>(itemTreeToken)!;
  const isCreating = ref(false);
  const title = ref('');

  const _target: Ref<Notebook | null> = shallowRef(null);
  const path = computed(() => {
    if (!_target.value) {
      return [];
    }

    return _target.value.getPath().split('/').slice(1);
  });

  const error = computed(() => {
    const status = _target.value?.checkChildTitle(
      title.value,
      EntityTypes.Notebook,
    );

    if (!status) {
      return '';
    }

    return TITLE_STATUS_TEXT[status];
  });

  function startCreating(target: Notebook = root) {
    _target.value = target;
    isCreating.value = true;
  }

  function stopCreating(isConfirmed: boolean) {
    if (isConfirmed && _target.value && !error.value) {
      createSubNotebook(title.value, _target.value);
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
    error,
  };
  provide(token, service);

  return service;
}
