import { computed, inject } from 'vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  SettingService,
  token as settingToken,
} from 'domain/service/SettingService';
import { token as contextmenuToken } from '../Contextmenu/useContextmenu';
import {
  Notebook,
  TreeItem,
  SortByEnums,
  SortDirectEnums,
} from 'domain/entity';

export function useSort() {
  const {
    itemTree: { selectedItem, setSortBy, setSortDirect },
  } = inject<ItemTreeService>(itemTreeToken)!;
  const {
    setting: { get: getSetting },
  } = inject<SettingService>(settingToken)!;

  const { context } = inject(contextmenuToken)!;
  const notebook = computed(
    () => (context.value || selectedItem.value) as TreeItem,
  );
  function handleClick(attr: 'sortBy', obj: { key: SortByEnums }): void;
  function handleClick(attr: 'direct', obj: { key: SortDirectEnums }): void;
  function handleClick(
    attr: 'sortBy' | 'direct',
    { key }: { key: SortByEnums | SortDirectEnums },
  ) {
    if (!Notebook.isA(notebook.value)) {
      return;
    }

    switch (attr) {
      case 'sortBy':
        setSortBy(notebook.value, key as SortByEnums);
        return;
      case 'direct':
        setSortDirect(notebook.value, key as SortDirectEnums);
        return;
      default:
        break;
    }
  }

  return {
    handleClick,
    currentSortValue: computed(() => {
      if (!Notebook.isA(notebook.value)) {
        return;
      }

      const sortBy = notebook.value.sortBy.value;
      return sortBy === SortByEnums.Default
        ? getSetting('defaultSortBy')
        : sortBy;
    }),
    currentDirectValue: computed(() => {
      if (!Notebook.isA(notebook.value)) {
        return;
      }

      const sortDirect = notebook.value.sortDirect.value;
      return sortDirect === SortDirectEnums.Default
        ? getSetting('defaultSortDirect')
        : sortDirect;
    }),
    allowDirect: computed(() =>
      Notebook.isA(notebook.value)
        ? notebook.value.sortBy.value !== SortByEnums.Custom
        : false,
    ),
    sortOptions: [
      { key: SortByEnums.Title, title: '?????????' },
      { key: SortByEnums.UpdatedAt, title: '???????????????' },
      { key: SortByEnums.CreatedAt, title: '???????????????' },
      { key: SortByEnums.Custom, title: '????????????' },
    ],
    sortDirectOptions: [
      { key: SortDirectEnums.Asc, title: '??????' },
      { key: SortDirectEnums.Desc, title: '??????' },
    ],
  };
}
