import { ref } from '@vue/reactivity';
import { SortByEnums, SortDirectEnums } from './Notebook';
import { DataPropertyNames } from './abstract/Entity';
import { singleton } from 'tsyringe';

@singleton()
export class Setting {
  readonly defaultSortBy = ref(SortByEnums.Title);
  readonly defaultSortDirect = ref(SortDirectEnums.Asc);

  get(key: DataPropertyNames<Setting>) {
    return this[key].value;
  }
}
export const APP_NAME = 'cyl-note';
