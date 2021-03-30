import { ref, inject, Ref, shallowRef, provide, InjectionKey } from 'vue';
import { TreeItem } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';

export const token: InjectionKey<ReturnType<typeof useRename>> = Symbol();

export function useRename() {
  const { rename } = inject<ItemTreeService>(itemTreeToken)!;

  const title = ref('');
  const renamingItem: Ref<TreeItem | null> = shallowRef(null);

  function startEditing(target: TreeItem) {
    renamingItem.value = target;
    title.value = target.title.value;
  }

  function stopEditing(isConfirmed: boolean) {
    if (isConfirmed && title.value) {
      rename(renamingItem.value!, title.value);
    }

    renamingItem.value = null;
  }

  const service = {
    startEditing,
    stopEditing,
    title,
    renamingItem,
  };

  provide(token, service);

  return service;
}
