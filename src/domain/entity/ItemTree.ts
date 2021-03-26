import {
  shallowRef,
  computed,
  effect,
  shallowReactive,
  stop,
} from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { isString, last, pull } from 'lodash';
import EventEmitter from 'eventemitter3';

import { KvStorage } from 'utils/kvStorage';
import { Class } from 'utils/types';
import { Note } from './Note';
import { Notebook } from './Notebook';
import { EntityEvents } from './abstract/Entity';

export enum ItemTreeEvents {
  Selected = 'SELECTED',
  Expanded = 'EXPANDED',
}

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
  readonly selectedItem: Ref<Notebook | Note | null> = shallowRef(null);
  readonly expandedItems: Notebook[] = shallowReactive([]);
  editingNotes: Ref<Note[]> = shallowRef([]);
  constructor() {
    super();
    this.maintainHistory();
  }

  loadRoot(notebook: Notebook) {
    this.root.value = notebook;
  }

  setSelectedItem(item: TreeItem) {
    const _item =
      this.itemsKV.getItem(item.id) ||
      this.itemsKV.getItem(item.getParent()?.id);

    if (!isTreeItem(_item)) {
      return;
    }

    this.selectedItem.value = _item;
    this.emit(ItemTreeEvents.Selected, _item);
  }

  private maintainHistory() {
    this.on(ItemTreeEvents.Selected, (item: TreeItem) => {
      if (Notebook.isA(item) && last(this.history) !== item) {
        this.history.push(item);
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

  getItem(id: TreeItemId): unknown;
  getItem<T>(id: TreeItemId, aClass: Class<T>): T;
  getItem<T>(id: TreeItemId, aClass?: Class<T>): unknown {
    return aClass ? this.itemsKV.getItem(id, aClass) : this.itemsKV.getItem(id);
  }

  putItem(items: TreeItem | TreeItem[]) {
    if (Array.isArray(items)) {
      this.itemsKV.setItems(items);
    } else {
      this.itemsKV.setItem(items.id, items);
    }
  }

  foldNotebook(notebook: Notebook) {
    pull(this.expandedItems, notebook);
  }

  async expandNotebook(notebook: Notebook) {
    if (notebook.isRoot || this.isExpanded(notebook)) {
      return;
    }

    this.expandedItems.push(notebook);
    this.emit(ItemTreeEvents.Expanded, notebook);
  }

  moveTo(child: TreeItem, parent: Notebook) {
    if (child.parentId.value === parent.id) {
      return;
    }

    child.setParent(parent, true);
    this.emit(EntityEvents.Sync, child);
  }

  moveToRoot(child: Notebook | Notebook['id']) {
    if (!this.root.value) {
      throw new Error('no root notebook');
    }

    const _child = isString(child) ? this.getItem(child, Notebook) : child;
    this.moveTo(_child, this.root.value);
  }

  isExpanded(notebook: Notebook) {
    const isEqual = notebook.isEqual.bind(notebook);

    return this.expandedItems.findIndex(isEqual) >= 0;
  }

  rename(item: TreeItem, title: string) {
    item.title.value = title;
    this.emit(EntityEvents.Sync, item);
  }

  static isA(instance: unknown): instance is TreeItem {
    return instance instanceof Notebook || instance instanceof Note;
  }
}

export const isTreeItem = ItemTree.isA;
