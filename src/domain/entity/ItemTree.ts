import { shallowRef, shallowReactive, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { singleton } from 'tsyringe';
import { pull } from 'lodash';
import EventEmitter from 'eventemitter3';

import { Note } from './Note';
import {
  Notebook,
  ROOT_NOTEBOOK_ID,
  TitleStatus,
  SortByEnums,
  SortDirectEnums,
} from './Notebook';
import { SafeMap } from 'utils/index';
import { EntityTypes } from './abstract/Entity';

export enum ItemTreeEvents {
  Selected = 'SELECTED',
  Deleted = 'DELETED',
  Updated = 'UPDATED',
  Loaded = 'LOADED',
  Created = 'CREATED',
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
  readonly indexedNotes = new SafeMap<Note['id'], Note>();
  readonly indexedNotebooks = new SafeMap<Notebook['id'], Notebook>();

  loadTree(rootItems: TreeItem[]) {
    this.indexedNotebooks.set(this.root.id, this.root);
    rootItems.forEach((item) => item.setParent(this.root, true));
    this.emit(ItemTreeEvents.Loaded);

    const indexFunc = (item: TreeItem) => {
      if (Note.isA(item)) {
        this.indexedNotes.set(item.id, item);
      }

      if (Notebook.isA(item)) {
        this.indexedNotebooks.set(item.id, item);
        item.children.value?.forEach(indexFunc);
      }
    };

    rootItems.forEach(indexFunc);
  }

  setSelectedItem(item: TreeItem) {
    const _item = (() => {
      if (!Notebook.isA(item) && this.mode.value === ViewMode.TwoColumn) {
        return item.parent;
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

    if (child.parent?.isEqual(parent)) {
      return;
    }

    if (Note.isA(child) && !parent) {
      return;
    }

    const snapshot = child.toDataObject();
    const _parent = parent || this.root;
    const newTitle = _parent.getUniqueTitle(child.title.value);

    if (newTitle !== child.title.value) {
      child.title.value = newTitle;
    }

    child.setParent(_parent, true);
    this.emit(ItemTreeEvents.Updated, child, snapshot, ['title', 'parentId']);
  }

  private isExpanded(notebook: Notebook) {
    const isEqual = notebook.isEqual.bind(notebook);

    return this.expandedItems.findIndex(isEqual) >= 0;
  }

  rename(item: TreeItem, title: string) {
    if (!title) {
      throw new Error('empty title!');
    }

    const snapshot = item.toDataObject();

    if (item.parent) {
      const type = Notebook.isA(item) ? EntityTypes.Notebook : EntityTypes.Note;
      const titleStatus = item.parent.checkChildTitle(title, type);

      if (titleStatus !== TitleStatus.Valid) {
        throw new Error('invalid name');
      }
    }

    item.title.value = title;
    this.emit(ItemTreeEvents.Updated, item, snapshot, ['title']);
  }

  deleteItem(item: TreeItem) {
    const parent = item.parent;

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
    this.indexedNotebooks.delete(item.id);
    this.indexedNotes.delete(item.id);
  }
  createNote(parent?: Notebook) {
    const target = parent || this.selectedItem.value;

    if (!Notebook.isA(target)) {
      throw new Error('no target notebook');
    }

    const newNote = target.createNote();
    this.indexedNotes.set(newNote.id, newNote);
    this.setSelectedItem(newNote);
    this.emit(ItemTreeEvents.Created, newNote);

    return newNote;
  }

  createSubNotebook(title: string, parent: Notebook) {
    const newNotebook = parent.createSubNotebook(title);

    if (parent) {
      this.expandNotebook(parent);
    }

    this.setSelectedItem(newNotebook);
    this.emit(ItemTreeEvents.Created, newNotebook);
    this.indexedNotebooks.set(newNotebook.id, newNotebook);

    return newNotebook;
  }

  createIndexNote(parent: Notebook) {
    const newNote = parent.createIndexNote();
    const snapshot = parent.toDataObject();
    this.setSelectedItem(parent);

    this.emit(ItemTreeEvents.Created, newNote);
    this.emit(ItemTreeEvents.Updated, parent, snapshot, ['indexNoteId']);
    this.indexedNotes.set(newNote.id, newNote);
    return newNote;
  }

  setSortBy(notebook: Notebook, value: SortByEnums) {
    const snapshot = notebook.toDataObject();

    if (value === SortByEnums.Custom) {
      notebook.sortedChildren.value.forEach((item, index) => {
        const snapshot = notebook.toDataObject();

        item.sortOrder.value = index + 1;
        this.emit(ItemTreeEvents.Updated, item, snapshot, ['sortOrder']);
      });
    }

    notebook.sortBy.value = value;
    this.emit(ItemTreeEvents.Updated, notebook, snapshot, ['sortBy']);
  }

  setSortDirect(notebook: Notebook, value: SortDirectEnums) {
    const snapshot = notebook.toDataObject();

    notebook.sortDirect.value = value;
    this.emit(ItemTreeEvents.Updated, notebook, snapshot, ['sortDirect']);
  }

  setSortOrders(items: TreeItem[]) {
    items.forEach((item, index) => {
      const snapshot = item.toDataObject();
      item.sortOrder.value = index + 1;
      this.emit(ItemTreeEvents.Updated, item, snapshot, ['sortOrder']);
    });
  }
}
