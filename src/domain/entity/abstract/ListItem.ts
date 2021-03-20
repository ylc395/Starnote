import { Ref } from '@vue/reactivity';

export interface ListItem {
  readonly withContextmenu?: Ref<boolean>;
  readonly sortOrder?: Ref<number>;
}

export function isWithContextmenu(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any,
): instance is Pick<Required<ListItem>, 'withContextmenu'> {
  return instance?.withContextmenu;
}
