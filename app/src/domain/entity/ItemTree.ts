import { shallowRef, shallowReactive, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { container, singleton } from 'tsyringe';
import { compact, pull, last } from 'lodash';
import { Subject } from 'rxjs';
import { Note, NoteDataObject, INDEX_NOTE_TITLE, NOTE_SUFFIX } from './Note';
import {
  Notebook,
  ROOT_NOTEBOOK_ID,
  TitleStatus,
  SortByEnums,
  SortDirectEnums,
  NotebookDataObject,
} from './Notebook';
import { SafeMap } from 'utils/helper';
import { EntityTypes } from './abstract/Entity';
import { token as loggerToken } from '../service/LoggerService';

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
export class ItemTree {
  private readonly logger = container.resolve(loggerToken);
  readonly root: Notebook = Notebook.from({
    id: ROOT_NOTEBOOK_ID,
    title: 'ROOT',
  });
  readonly mode: Ref<ViewMode> = ref(ViewMode.TwoColumn);
  readonly selectedItem: Ref<Notebook | Note | null> = shallowRef(null);
  readonly expandedItems: Notebook[] = shallowReactive([]);
  readonly indexedNotes = new SafeMap<Note['id'], Note>();
  readonly indexedNotebooks = new SafeMap<Notebook['id'], Notebook>();
  private readonly _event$ = new Subject<{
    event: ItemTreeEvents;
    item?: TreeItem;
    snapshot?: NoteDataObject | NotebookDataObject;
    fields?: (keyof NoteDataObject)[] | (keyof NotebookDataObject)[];
  }>();

  readonly event$ = this._event$.asObservable();
  constructor() {
    this._event$.subscribe((payload) => {
      this.logger.debug('itemTree', payload);
    });
  }

  loadTree(rootItems: TreeItem[]) {
    this.indexedNotebooks.set(this.root.id, this.root);
    rootItems.forEach((item) => item.setParent(this.root, true));

    const indexFunc = (item: TreeItem) => {
      if (Note.isA(item)) {
        this.indexedNotes.set(item.id, item);
      }

      if (Notebook.isA(item)) {
        this.indexedNotebooks.set(item.id, item);
        item.children.value.forEach(indexFunc);
      }
    };

    rootItems.forEach(indexFunc);
    this._event$.next({ event: ItemTreeEvents.Loaded });
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
    this._event$.next({ event: ItemTreeEvents.Selected, item: _item });
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

    if (!child.parent) {
      throw new Error('no parent. Use `createNote` if this is a new note');
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
    this._event$.next({
      event: ItemTreeEvents.Updated,
      item: child,
      snapshot,
      fields: ['title', 'parentId'],
    });
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
    this._event$.next({
      event: ItemTreeEvents.Updated,
      item,
      snapshot,
      fields: ['title'],
    });
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

    this._event$.next({ event: ItemTreeEvents.Deleted, item });
    this.indexedNotebooks.delete(item.id);
    this.indexedNotes.delete(item.id);
  }
  createNote(parent?: Notebook, noteDO?: NotebookDataObject) {
    const target = parent || this.selectedItem.value;

    if (!Notebook.isA(target)) {
      throw new Error('no target notebook');
    }

    const newNote = target.createNote(noteDO);
    this.indexedNotes.set(newNote.id, newNote);
    this.setSelectedItem(newNote);
    this._event$.next({ event: ItemTreeEvents.Created, item: newNote });

    return newNote;
  }

  createSubNotebook(title: string, parent: Notebook) {
    const newNotebook = parent.createSubNotebook(title);

    if (parent) {
      this.expandNotebook(parent);
    }

    this.setSelectedItem(newNotebook);
    this._event$.next({ event: ItemTreeEvents.Created, item: newNotebook });
    this.indexedNotebooks.set(newNotebook.id, newNotebook);

    return newNotebook;
  }

  createIndexNote(parent: Notebook) {
    const newNote = parent.createIndexNote();
    const snapshot = parent.toDataObject();
    this.setSelectedItem(parent);

    this._event$.next({ event: ItemTreeEvents.Created, item: newNote });
    this._event$.next({
      event: ItemTreeEvents.Updated,
      item: parent,
      snapshot,
      fields: ['indexNoteId'],
    });
    this.indexedNotes.set(newNote.id, newNote);
    return newNote;
  }

  setSortBy(notebook: Notebook, value: SortByEnums) {
    const snapshot = notebook.toDataObject();

    if (value === SortByEnums.Custom) {
      notebook.sortedChildren.value.forEach((item, index) => {
        const snapshot = notebook.toDataObject();

        item.sortOrder.value = index + 1;
        this._event$.next({
          event: ItemTreeEvents.Updated,
          item,
          snapshot,
          fields: ['sortOrder'],
        });
      });
    }

    notebook.sortBy.value = value;
    this._event$.next({
      event: ItemTreeEvents.Updated,
      item: notebook,
      snapshot,
      fields: ['sortBy'],
    });
  }

  setSortDirect(notebook: Notebook, value: SortDirectEnums) {
    const snapshot = notebook.toDataObject();

    notebook.sortDirect.value = value;
    this._event$.next({
      event: ItemTreeEvents.Updated,
      item: notebook,
      snapshot,
      fields: ['sortDirect'],
    });
  }

  setSortOrders(items: TreeItem[]) {
    items.forEach((item, index) => {
      const snapshot = item.toDataObject();
      item.sortOrder.value = index + 1;
      this._event$.next({
        event: ItemTreeEvents.Updated,
        item,
        snapshot,
        fields: ['sortDirect'],
      });
    });
  }

  getItemByPath(path: string, ensure = false) {
    const titles = compact(path.split('/'));
    let notebook = this.root;

    for (let i = 0; i < titles.length; i++) {
      const title = decodeURIComponent(titles[i]);
      const name = ItemTree.removeSuffix(title);
      const isNote = title.endsWith(NOTE_SUFFIX);
      const isLast = i === titles.length - 1;
      const isIndexNote = isNote && name === INDEX_NOTE_TITLE;

      if (isNote && !isLast) {
        throw new Error(`invalid path ${path}`);
      }

      let child = isIndexNote
        ? notebook.indexNote.value
        : notebook.children.value.find((item) => {
            return (
              item.title.value === name &&
              (isNote ? Note.isA(item) : Notebook.isA(item))
            );
          });

      if (Note.isA(child)) {
        return child;
      }

      if (!child) {
        if (!ensure) {
          return null;
        }

        if (isNote) {
          return this.createNote(notebook, { title: name });
        }

        child = this.createSubNotebook(name, notebook);
      }

      notebook = child;
    }

    return notebook;
  }

  private static removeSuffix(title: string) {
    return title.replace(new RegExp(`\\${NOTE_SUFFIX}$`), '');
  }

  static getTitleWithoutSuffix(path: string) {
    const fileName = last(path.split('/'));

    if (!fileName) {
      throw new Error(`no file name in ${path}`);
    }

    return ItemTree.removeSuffix(decodeURIComponent(fileName));
  }
}
