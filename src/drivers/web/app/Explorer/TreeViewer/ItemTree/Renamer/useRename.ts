import {
  ref,
  inject,
  Ref,
  shallowRef,
  provide,
  InjectionKey,
  computed,
} from 'vue';
import { TreeItem, TitleStatus } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';

export const token: InjectionKey<ReturnType<typeof useRename>> = Symbol();

export function useRename() {
  const {
    itemTree: { rename },
  } = inject<ItemTreeService>(itemTreeToken)!;

  const title = ref('');
  const renamingItem: Ref<TreeItem | null> = shallowRef(null);
  const error = computed(() => {
    if (!renamingItem.value) {
      return;
    }

    const status = renamingItem.value?.parent?.checkChildTitle(
      title.value,
      renamingItem.value,
    );

    if (!status) {
      return '';
    }

    const msgs = {
      [TitleStatus.DuplicatedError]: `重复的标题`,
      [TitleStatus.EmptyError]: '标题不得为空',
      [TitleStatus.PreservedError]: `${title.value} 不能作为标题`,
    };

    return msgs[status];
  });

  function startEditing(target: TreeItem) {
    renamingItem.value = target;
    title.value = target.title.value;
  }

  function stopEditing(isConfirmed: boolean) {
    if (isConfirmed && error.value) {
      return;
    }

    if (isConfirmed) {
      rename(renamingItem.value!, title.value);
    }

    renamingItem.value = null;
  }

  const service = {
    startEditing,
    stopEditing,
    title,
    renamingItem,
    error,
  };

  provide(token, service);

  return service;
}
