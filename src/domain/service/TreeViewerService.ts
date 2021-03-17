import { NotebookRepository, NoteRepository } from 'domain/repository';
import { container } from 'tsyringe';
import { shallowRef, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import { KvStorage } from 'utils/kvStorage';
import { without } from 'lodash';
import EventEmitter from 'eventemitter3';

const notebookRepository = container.resolve(NotebookRepository);
const noteRepository = container.resolve(NoteRepository);

export type TreeItemId = Notebook['id'] | Note['id'];
export type TreeItem = Notebook | Note;

export class TreeViewerService extends EventEmitter {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly itemsKV = new KvStorage();
  readonly selectedIds: Ref<(Notebook['id'] | Note['id'])[]> = ref([]);
  get selectedItem(): Notebook | Note | null {
    const firstSelectedItemId = this.selectedIds.value[0];
    return firstSelectedItemId
      ? this.itemsKV.getItem(firstSelectedItemId)
      : null;
  }
  expandedIds: Ref<Notebook['id'][]> = ref([]);
  constructor() {
    super();
    this.init();
  }
  async init() {
    this.on('itemUpdated', this.syncItem);
    this.on('itemUpdated', this.setSelectedItem, this);

    notebookRepository.on('itemFetched', this.putTreeItemsInCache, this);
    notebookRepository.on('notebookCreated', this.putTreeItemsInCache, this);

    this.root.value = await notebookRepository.queryOrCreateRootNotebook();
  }

  setSelectedItem(item: TreeItem) {
    this.selectedIds.value = [item.id];
  }
  private syncItem(item: Note | Notebook) {
    if (item instanceof Note) {
      noteRepository.updateNote(item);
    }

    if (item instanceof Notebook) {
      notebookRepository.updateNotebook(item);
    }
  }

  putTreeItemsInCache(items: TreeItem | TreeItem[]) {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.id) {
          this.itemsKV.setItem(item.id, item);
        }
      });
    } else if (items.id) {
      this.itemsKV.setItem(items.id, items);
    }
  }

  getSelectedNotebook() {
    if (!this.selectedItem) {
      return null;
    }

    if (this.selectedItem instanceof Notebook) {
      return this.selectedItem;
    }

    return this.itemsKV.getItem(this.selectedItem.parentId.value, Notebook);
  }

  foldNotebook(notebookId: Notebook['id']) {
    this.expandedIds.value = without(this.expandedIds.value, notebookId);
  }

  async expandNotebook(
    notebookId: Notebook['id'] | Notebook | null,
    expandParent = true,
  ) {
    if (!notebookId) {
      throw new Error('no notebook to expand');
    }

    const notebook =
      notebookId instanceof Notebook
        ? notebookId
        : this.itemsKV.getItem(notebookId, Notebook);

    if (notebook.isRoot) {
      return;
    }

    const hasParent =
      notebook.parentId.value &&
      notebook.parentId.value !== this.root.value?.id;

    await notebookRepository.loadChildren(notebook);

    if (hasParent && expandParent) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.expandNotebook(notebook.parentId.value!, true);
    }

    if (!this.expandedIds.value.includes(notebook.id)) {
      this.expandedIds.value.push(notebook.id);
      this.expandedIds.value = [...this.expandedIds.value];
    }
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
}
