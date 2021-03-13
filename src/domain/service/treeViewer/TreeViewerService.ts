import { NotebookRepository } from 'domain/repository';
import { container, singleton } from 'tsyringe';
import { shallowReactive, shallowRef, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import { pull } from 'lodash';
import { KvStorage } from "utils/kvStorage";

const notebookRepository = container.resolve(NotebookRepository);

export type TreeItemId = Notebook['id'] | Note['id'];
type TreeItem = Notebook | Note;

@singleton()
export class TreeViewerService {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly itemsKV = new KvStorage();
  private selectedItem: Notebook | Note | null = null;

  expandedIds: Ref<Notebook['id'][]> = ref([]);
  constructor() {
    this.init();
  }
  async init() {
    notebookRepository.addListener('itemFetched', this.putTreeItemsInCache, this);
    this.root.value = await notebookRepository.queryOrCreateRootNotebook();
    this.selectedItem = this.root.value;
  }

  putTreeItemsInCache(items: TreeItem | TreeItem[]) {
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item.id) {
            this.itemsKV.setItem(item.id, item);
          }
        });
      } else if(items.id) {
          this.itemsKV.setItem(items.id, items);
      }
  }

  async loadChildrenOf(id: Notebook['id']) {
    const notebook = this.itemsKV.getItem(id, Notebook);

    notebook.children.value = shallowReactive(await notebookRepository.queryChildrenOf(notebook));
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  getSelectedNotebook() {
    if (!this.selectedItem) {
      return this.root.value;      
    }

    if (this.selectedItem instanceof Notebook) {
      return this.selectedItem;
    }

    return this.itemsKV.getItem(this.selectedItem.notebookId.value, Notebook)
  }

  resetSelectedItem() {
    this.selectedItem = this.root.value;
  }

  setSelectedItem(id: TreeItemId) {
    const item = this.itemsKV.getItem<TreeItem>(id);

    this.selectedItem = item;
  }

  expandNotebook(notebookId: Notebook['id']) {
    if (!this.expandedIds.value.includes(notebookId)) {
      this.expandedIds.value.push(notebookId);
    }

    const notebook = this.itemsKV.getItem(notebookId, Notebook);

    if (!notebook.children.value) {
      this.loadChildrenOf(notebookId); 
    }

    if (notebook.parentId.value) {
      this.expandNotebook(notebook.parentId.value);
    }
  }

  removeExpandedId(notebookId: Notebook['id']) {
    pull(this.expandedIds.value, notebookId);
  }
}
