import { Ref } from '@vue/reactivity';
import { hasIn } from 'lodash';

interface WithContextMenu {
  readonly withContextmenu: Ref<boolean>;
}

export type ListItem = {
  readonly sortOrder?: Ref<number>;
} & Partial<WithContextMenu>;

export function isWithContextmenu(
  instance: unknown,
): instance is WithContextMenu {
  return hasIn(instance, 'withContextmenu');
}
