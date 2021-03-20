import {
  shallowRef,
  ref,
  computed,
  effect,
  shallowReactive,
  stop,
} from '@vue/reactivity';
import type { Ref, ComputedRef } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';
import { KvStorage } from 'utils/kvStorage';
import { last, without } from 'lodash';
import EventEmitter from 'eventemitter3';

export type TreeItemId = Notebook['id'] | Note['id'];
export type TreeItem = Notebook | Note;
export class ItemTree extends EventEmitter {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  readonly itemsKV = new KvStorage();
  private historyMaintainer: ReturnType<typeof effect> | null = null;
  private readonly history: Notebook[] = shallowReactive([]);
  isEmptyHistory = computed(() => {
    return this.history.length <= 1;
  });
  readonly selectedIds: Ref<(Notebook['id'] | Note['id'])[]> = ref([]);
  readonly selectedItem: ComputedRef<Notebook | Note | null> = computed(() => {
    const firstSelectedItemId = this.selectedIds.value[0];
    return firstSelectedItemId
      ? this.itemsKV.getItem(firstSelectedItemId)
      : null;
  });
  expandedIds: Ref<Notebook['id'][]> = ref([]);
  constructor() {
    super();
    this.maintainHistory();
    this.on('itemUpdated', this.setSelectedItem, this);
  }

  loadRoot(notebook: Notebook) {
    this.root.value = notebook;
  }

  setSelectedItem(item?: TreeItem | TreeItemId) {
    this.selectedIds.value = item
      ? [typeof item === 'object' ? item.id : item]
      : [];
  }

  private maintainHistory() {
    this.historyMaintainer = effect(() => {
      const selected = this.selectedItem.value;

      if (Notebook.isA(selected) && last(this.history) !== selected) {
        this.history.push(selected);
      }
    });
  }

  historyBack() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    stop(this.historyMaintainer!);
    this.history.pop();

    const lastNotebook = this.history.pop();
    this.setSelectedItem(lastNotebook);

    this.maintainHistory();
  }

  putTreeItemsInCache(items: TreeItem | TreeItem[]) {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        this.itemsKV.setItem(item.id, item);
      });
    } else {
      this.itemsKV.setItem(items.id, items);
    }
  }

  foldNotebook(notebookId: Notebook['id']) {
    this.expandedIds.value = without(this.expandedIds.value, notebookId);
  }

  setParent(childId: TreeItemId, parentId: Notebook['id']) {
    const parent = this.itemsKV.getItem(parentId, Notebook);
    const child = this.itemsKV.getItem<TreeItem>(childId);

    if (child.parentId.value === parent.id) {
      return;
    }

    child.setParent(parent);
    this.emit('itemUpdated', child);
  }

  setRootAsParent(childId: TreeItemId) {
    if (!this.root.value) {
      throw new Error('no root notebook');
    }
    this.setParent(childId, this.root.value.id);
  }

  static isTreeItem(instance: unknown): instance is TreeItem {
    return instance instanceof Notebook || instance instanceof Note;
  }
}

export const isTreeItem = ItemTree.isTreeItem;
