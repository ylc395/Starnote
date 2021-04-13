import { inject, ref, shallowRef, provide, computed } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { EntityTypes, Notebook, TitleStatus } from 'domain/entity';

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

    const ancestors = _target.value.ancestors;
    const [, ...path] = ancestors;

    if (!_target.value.isRoot) {
      path.push(_target.value);
    }

    return path.map(({ title }) => title.value);
  });

  const error = computed(() => {
    const status = _target.value?.checkChildTitle(
      title.value,
      EntityTypes.Notebook,
    );
    const msgs = {
      [TitleStatus.DuplicatedError]: '重复的目录名',
      [TitleStatus.EmptyError]: '目录名不得为空',
      [TitleStatus.PreservedError]: `${title.value} 不能作为目录名`,
      [TitleStatus.InvalidFileNameError]: '包含非法字符',
    };

    if (!status) {
      return '';
    }

    return msgs[status];
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
