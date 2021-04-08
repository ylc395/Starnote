import { shallowRef, shallowReactive, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { pull } from 'lodash';
import EventEmitter from 'eventemitter3';

import { Note } from './Note';
import { Notebook, ROOT_NOTEBOOK_ID } from './Notebook';
import { singleton } from 'tsyringe';
import { SafeMap } from 'utils/index';

export enum ItemTreeEvents {
  Selected = 'SELECTED',
  Deleted = 'DELETED',
  Updated = 'UPDATED',
  Loaded = 'LOADED',
}

export enum ViewMode {
  OneColumn = 'ONE_COLUMN',
  TwoColumn = 'TWO_COLUMN',
}

export type TreeItem = Notebook | Note;

@singleton()
export class ItemTree extends EventEmitter<ItemTreeEvents> {
  readonly root: Notebook = Notebook.from({
    id: ROOT_NOTEBOOK_ID,
    title: 'ROOT',
  });
  readonly mode: Ref<ViewMode> = ref(ViewMode.TwoColumn);
  readonly selectedItem: Ref<Notebook | Note | null> = shallowRef(null);
  readonly expandedItems: Notebook[] = shallowReactive([]);
  readonly indexedNotes = new SafeMap<TreeItem['id'], Note>();

  loadTree(rootItems: TreeItem[]) {
    rootItems.forEach((item) => item.setParent(this.root, true));
    this.emit(ItemTreeEvents.Loaded);

    const indexFunc = (item: TreeItem) => {
      if (Note.isA(item)) {
        this.indexedNotes.set(item.id, item);
      }

      if (Notebook.isA(item)) {
        item.children.value?.forEach(indexFunc);
      }
    };

    rootItems.forEach(indexFunc);
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
  }

  moveTo(child: TreeItem, parent: Notebook | null) {
    if (!child) {
      throw new Error('no item to move');
    }

    if (child.getParent()?.isEqual(parent)) {
      return;
    }

    if (Note.isA(child) && !parent) {
      return;
    }

    child.setParent(parent || this.root, true);
    this.emit(ItemTreeEvents.Updated, child, ['parentId']);
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
    this.emit(ItemTreeEvents.Updated, item, ['title']);
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
