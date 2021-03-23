import {
  shallowRef,
  computed,
  effect,
  shallowReactive,
  stop,
} from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note } from './Note';
import { Notebook } from './Notebook';
import { KvStorage } from 'utils/kvStorage';
import { isString, last, pull } from 'lodash';
import EventEmitter from 'eventemitter3';
import { Class } from 'utils/types';
import { EditorService } from 'domain/service/EditorService';

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
  constructor() {
    super();
    this.maintainHistory();
  }

  loadRoot(notebook: Notebook) {
    this.root.value = notebook;
  }

  setSelectedItem(item: TreeItem, editorService?: EditorService) {
    if (item.isEqual(this.selectedItem.value)) {
      return;
    }

    this.selectedItem.value = item;

    if (editorService) {
      editorService.openInEditor(item);
    }
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

  foldNotebook(notebook: Notebook) {
    pull(this.expandedItems, notebook);
  }

  async expandNotebook(notebook: Notebook) {
    if (notebook.isRoot || this.isExpanded(notebook)) {
      return;
    }

    this.expandedItems.push(notebook);
  }

  moveTo(child: TreeItem, parent: Notebook) {
    if (child.parentId.value === parent.id) {
      return;
    }

    child.setParent(parent);
    this.setSelectedItem(child);
    this.emit('sync', child);
  }

  moveToRoot(child: Notebook | Notebook['id']) {
    if (!this.root.value) {
      throw new Error('no root notebook');
    }

    const _child = isString(child) ? this.getItem(child) : child;

    if (!Notebook.isA(_child)) {
      return;
    }

    this.moveTo(_child, this.root.value);
  }

  isExpanded(notebook: Notebook) {
    const isEqual = notebook.isEqual.bind(notebook);

    return this.expandedItems.findIndex(isEqual) >= 0;
  }

  static isTreeItem(instance: unknown): instance is TreeItem {
    return instance instanceof Notebook || instance instanceof Note;
  }
}

export const isTreeItem = ItemTree.isTreeItem;
