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
import { isEqual, last, without } from 'lodash';
import EventEmitter from 'eventemitter3';
import { Class } from 'utils/types';

type TreeItemId = Notebook['id'] | Note['id'];
export type TreeItem = Notebook | Note;
export class ItemTree extends EventEmitter {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly itemsKV = new KvStorage();
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
  }

  loadRoot(notebook: Notebook) {
    this.root.value = notebook;
  }

  setSelectedItem(item: TreeItem) {
    const newSelectedItem = [item.id];

    if (isEqual(newSelectedItem, this.selectedIds.value)) {
      return;
    }

    this.selectedIds.value = newSelectedItem;
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

    if (lastNotebook) {
      this.setSelectedItem(lastNotebook);
    }

    this.maintainHistory();
  }

  getItem<T>(id: TreeItemId, aClass?: Class<T>) {
    return this.itemsKV.getItem(id, aClass);
  }

  putItem(items: TreeItem | TreeItem[]) {
    if (Array.isArray(items)) {
      this.itemsKV.setItems(items);
    } else {
      this.itemsKV.setItem(items.id, items);
    }
  }

  foldNotebook(notebookId: Notebook['id']) {
    this.expandedIds.value = without(this.expandedIds.value, notebookId);
  }

  moveTo(child: TreeItem, parent: Notebook) {
    if (child.parentId.value === parent.id) {
      return;
    }

    child.setParent(parent);
    this.setSelectedItem(child);
    this.emit('sync', child);
  }

  moveToRoot(child: TreeItem | TreeItemId) {
    if (!this.root.value) {
      throw new Error('no root notebook');
    }

    this.moveTo(
      isTreeItem(child) ? child : this.getItem(child),
      this.root.value,
    );
  }

  isExpanded(notebook: Notebook) {
    return this.expandedIds.value.includes(notebook.id);
  }

  static isTreeItem(instance: unknown): instance is TreeItem {
    return instance instanceof Notebook || instance instanceof Note;
  }
}

export const isTreeItem = ItemTree.isTreeItem;
