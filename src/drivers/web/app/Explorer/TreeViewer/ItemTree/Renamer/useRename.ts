import {
  ref,
  inject,
  Ref,
  shallowRef,
  provide,
  InjectionKey,
  computed,
} from 'vue';
import { TreeItem, TITLE_STATUS_TEXT } from 'domain/entity';
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

    return TITLE_STATUS_TEXT[status];
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
