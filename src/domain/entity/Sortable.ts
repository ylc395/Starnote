import { Ref } from '@vue/runtime-core';

export enum SortByEnums {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  Title = 'TITLE',
  Custom = 'CUSTOM',
}

export enum SortDirectEnums {
  Asc = 'ASC',
  Desc = 'DESC',
}

export interface Sortable {
  sortOrder: Ref<number>;
}
