import { ref } from '@vue/reactivity';
import { SortByEnums, SortDirectEnums } from 'domain/constant';
import { singleton } from 'tsyringe';

@singleton()
export class Setting {
  readonly defaultSortBy = ref(SortByEnums.Title);
  readonly defaultSortDirect = ref(SortDirectEnums.Asc);
}
