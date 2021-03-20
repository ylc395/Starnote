import { provide, ref } from 'vue';
import type { Ref, InjectionKey } from 'vue';

export const token: InjectionKey<ReturnType<typeof useDragIcon>> = Symbol();
export function useDragIcon() {
  const noteIconRef: Ref<HTMLElement | null> = ref(null);
  const notebookIconRef: Ref<HTMLElement | null> = ref(null);

  const icons = { noteIconRef, notebookIconRef };
  provide(token, icons);

  return icons;
}
