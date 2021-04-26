import { Ref, ref } from '@vue/reactivity';
import { SortByEnums, SortDirectEnums } from './Notebook';
import { singleton } from 'tsyringe';
import { Note } from './Note';
import { pull } from 'lodash';

type SettingField = {
  [index in keyof Setting]: Setting[index] extends Ref ? index : never;
}[keyof Setting];

@singleton()
export class Setting {
  readonly defaultSortBy = ref(SortByEnums.Title);
  readonly defaultSortDirect = ref(SortDirectEnums.Asc);
  readonly noteListFields: Ref<(keyof Note)[]> = ref([]);

  get(key: SettingField) {
    return this[key].value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggle(key: SettingField, value: any) {
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
