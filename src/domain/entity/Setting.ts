import { Ref, ref } from '@vue/reactivity';
import { SortByEnums, SortDirectEnums } from './Notebook';
import { DataPropertyNames } from './abstract/Entity';
import { singleton } from 'tsyringe';
import { Note } from './Note';
import { pull } from 'lodash';

@singleton()
export class Setting {
  readonly defaultSortBy = ref(SortByEnums.Title);
  readonly defaultSortDirect = ref(SortDirectEnums.Asc);
  readonly noteListFields: Ref<(keyof Note)[]> = ref([]);

  get(key: DataPropertyNames<Setting>) {
    return this[key].value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggle(key: DataPropertyNames<Setting>, value: any) {
    const _value = this[key].value;

    if (!Array.isArray(_value)) {
      throw new Error(`${key} is not an array`);
    }

    if (_value.includes(value)) {
      pull(_value, value);
    } else {
      _value.push(value);
    }
  }
}
