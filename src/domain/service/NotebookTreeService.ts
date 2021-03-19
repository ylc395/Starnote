import {
  Children,
  NotebookRepository,
  NoteRepository,
} from 'domain/repository';
import { container } from 'tsyringe';
import {
  shallowRef,
  ref,
  computed,
  effect,
  shallowReactive,
  stop,
} from '@vue/reactivity';
import type { Ref, ComputedRef } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import { KvStorage } from 'utils/kvStorage';
import { last, without } from 'lodash';
import EventEmitter from 'eventemitter3';

const notebookRepository = container.resolve(NotebookRepository);
const noteRepository = container.resolve(NoteRepository);
const NOTEBOOK_ONLY = true;

export type TreeItemId = Notebook['id'] | Note['id'];
export type TreeItem = Notebook | Note;
export const token = Symbol();
export class NotebookTreeService extends EventEmitter {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly itemsKV = new KvStorage();
  private historyMaintainer: ReturnType<typeof effect> | null = null;
  private readonly history: Notebook[] = shallowReactive([]);
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
    this.init();
  }
  private async init() {
    this.maintainHistory();
    this.on('itemUpdated', this.syncItem);
    this.on('itemUpdated', this.setSelectedItem, this);

    notebookRepository.on('itemFetched', this.putTreeItemsInCache, this);
    notebookRepository.on('notebookCreated', this.putTreeItemsInCache, this);

    this.root.value = await notebookRepository.queryOrCreateRootNotebook(
      NOTEBOOK_ONLY,
    );
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

  private syncItem(item: Note | Notebook) {
    if (item instanceof Note) {
      noteRepository.updateNote(item);
    }

    if (item instanceof Notebook) {
      notebookRepository.updateNotebook(item);
    }
  }

  historyBack() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    stop(this.historyMaintainer!);
    this.history.pop();

    const lastNotebook = this.history.pop();
    this.setSelectedItem(lastNotebook);

    this.maintainHistory();
  }

  putTreeItemsInCache(items: TreeItem | Children) {
    if ('id' in items) {
      this.itemsKV.setItem(items.id, items);
    } else {
      [...items.notebooks, ...items.notes].forEach((item) => {
        this.itemsKV.setItem(item.id, item);
      });
    }
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

    await notebookRepository.loadChildren(notebook, NOTEBOOK_ONLY);

    const hasParent =
      notebook.parentId.value &&
      notebook.parentId.value !== this.root.value?.id;

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
