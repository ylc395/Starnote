import { shallowRef, shallowReactive, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { pull } from 'lodash';
import EventEmitter from 'eventemitter3';

import { Note } from './Note';
import { Notebook } from './Notebook';
import { singleton } from 'tsyringe';

export enum ItemTreeEvents {
  Selected = 'SELECTED',
  Expanded = 'EXPANDED',
  Deleted = 'DELETED',
}

export enum ViewMode {
  OneColumn = 'ONE_COLUMN',
  TwoColumn = 'TWO_COLUMN',
}

export type TreeItem = Notebook | Note;

@singleton()
export class ItemTree extends EventEmitter<ItemTreeEvents> {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  readonly mode: Ref<ViewMode> = ref(ViewMode.TwoColumn);
  readonly selectedItem: Ref<Notebook | Note | null> = shallowRef(null);
  readonly expandedItems: Notebook[] = shallowReactive([]);
  constructor() {
    super();
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

  moveTo(child: TreeItem, parent: Notebook) {
    if (!child) {
      throw new Error('no item to move');
    }

    if (child.getParent()?.isEqual(parent)) {
      return;
    }

    if (Note.isA(child) && parent.isRoot) {
      return;
    }

    child.setParent(parent, true);
  }

  private isExpanded(notebook: Notebook) {
    const isEqual = notebook.isEqual.bind(notebook);

    return this.expandedItems.findIndex(isEqual) >= 0;
  }

  rename(item: TreeItem, title: string) {
    if (!title) {
      throw new Error('empty title!');
    }

    item.title.value = title;
  }

  deleteItem(item: TreeItem) {
    const parent = item.getParent();

    if (!parent) {
      throw new Error('no parent when delete');
    }

    if (Note.isA(item) && item.isIndexNote) {
      parent.indexNote.value = null;
    } else {
      parent.removeChild(item);
    }

    const selected = this.selectedItem.value;

    if (selected) {
      const isSelfRemoved = selected.isEqual(item);
      const isAscRemoved = Notebook.isA(item) && selected.isDescendenceOf(item);

      if (isSelfRemoved || isAscRemoved) {
        this.setSelectedItem(parent);
      }
    }

    this.emit(ItemTreeEvents.Deleted, item);
  }
}
