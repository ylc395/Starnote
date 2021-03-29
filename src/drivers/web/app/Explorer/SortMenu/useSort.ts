import { computed, inject } from 'vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import {
  useContextmenu as useCommonContextmenu,
  token as contextmenuToken,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { SortByEnums, SortDirectEnums } from 'domain/constant';
import { Notebook } from 'domain/entity';

export function useSort() {
  const {
    itemTree: { selectedItem },
    setSortBy,
    setDirect,
  } = inject<ItemTreeService>(itemTreeToken)!;

  const { context } = inject<ReturnType<typeof useCommonContextmenu>>(
    contextmenuToken,
  )!;
  const notebook = computed(
    () => (context.value || selectedItem.value) as Notebook,
  );
  function handleClick(attr: 'sortBy', obj: { key: SortByEnums }): void;
  function handleClick(attr: 'direct', obj: { key: SortDirectEnums }): void;
  function handleClick(
    attr: 'sortBy' | 'direct',
    { key }: { key: SortByEnums | SortDirectEnums },
  ) {
    switch (attr) {
      case 'sortBy':
        setSortBy(notebook.value, key as SortByEnums);
        return;
      case 'direct':
        setDirect(notebook.value, key as SortDirectEnums);
        return;
      default:
        break;
    }
  }

  return {
    handleClick,
    currentSortValue: computed(() => notebook.value.sortBy.value),
    currentDirectValue: computed(() => notebook.value.sortDirect.value),
    allowDirect: computed(
      () => notebook.value.sortBy.value !== SortByEnums.Custom,
    ),
    sortOptions: [
      { key: SortByEnums.Title, title: '按标题' },
      { key: SortByEnums.UpdatedAt, title: '按修改日期' },
      { key: SortByEnums.CreatedAt, title: '按创建日期' },
      { key: SortByEnums.Custom, title: '手动排序' },
    ],
    sortDirectOptions: [
      { key: SortDirectEnums.Asc, title: '升序' },
      { key: SortDirectEnums.Desc, title: '降序' },
    ],
  };
}
