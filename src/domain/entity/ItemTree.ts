import { shallowRef, computed, shallowReactive, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { last, pull } from 'lodash';
import EventEmitter from 'eventemitter3';

import { Note } from './Note';
import { Notebook } from './Notebook';
import { EntityEvents } from './abstract/Entity';

export enum ItemTreeEvents {
  Selected = 'SELECTED',
  Expanded = 'EXPANDED',
}

export enum ViewMode {
  OneColumn = 'ONE_COLUMN',
  TwoColumn = 'TWO_COLUMN',
}

export type TreeItem = Notebook | Note;
export class ItemTree extends EventEmitter {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly history: Notebook[] = shallowReactive([]);
  readonly mode: Ref<ViewMode> = ref(ViewMode.TwoColumn);
  readonly isEmptyHistory = computed(() => {
    return this.history.length <= 1;
  });
  readonly selectedItem: Ref<Notebook | Note | null> = shallowRef(null);
  readonly expandedItems: Notebook[] = shallowReactive([]);
  readonly movingItem: Ref<TreeItem | null> = shallowRef(null);
  constructor() {
    super();
    this.on(ItemTreeEvents.Selected, this.maintainHistory, this);
  }

  loadRoot(notebook: Notebook) {
    this.root.value = notebook;
    this.expandNotebook(notebook);
  }

  setSelectedItem(item: TreeItem) {
    const _item = (() => {
      if (!Notebook.isA(item) && this.mode.value === ViewMode.TwoColumn) {
        return item.getParent();
      }

      return item;
    })();

    if (!_item) {
      return;
    }

    this.selectedItem.value = _item;
    this.emit(ItemTreeEvents.Selected, _item);
  }

  private maintainHistory(item: TreeItem) {
    if (Notebook.isA(item) && last(this.history) !== item) {
      this.history.push(item);
    }
  }

  historyBack() {
    this.removeListener(ItemTreeEvents.Selected, this.maintainHistory);
    this.history.pop();

    const lastNotebook = this.history.pop();

    if (lastNotebook) {
      this.setSelectedItem(lastNotebook);
    }

    this.on(ItemTreeEvents.Selected, this.maintainHistory, this);
  }

  foldNotebook(notebook: Notebook) {
    pull(this.expandedItems, notebook);
  }

  async expandNotebook(notebook: Notebook) {
    if (this.isExpanded(notebook)) {
      return;
    }

    this.expandedItems.push(notebook);
    this.emit(ItemTreeEvents.Expanded, notebook);
  }

  moveTo(parent: Notebook) {
    const child = this.movingItem.value;
    this.movingItem.value = null;

    if (!child) {
      throw new Error('no item to move');
    }

    if (child.parentId.value === parent.id) {
      return;
    }

    if (Note.isA(child) && parent.isRoot) {
      return;
    }

    child.setParent(parent, true);
    this.emit(EntityEvents.Sync, child);
  }

  isExpanded(notebook: Notebook) {
    const isEqual = notebook.isEqual.bind(notebook);

    return this.expandedItems.findIndex(isEqual) >= 0;
  }

  rename(item: TreeItem, title: string) {
    if (!title) {
      throw new Error('empty title!');
    }

    item.title.value = title;
    this.emit(EntityEvents.Sync, item);
  }
}
