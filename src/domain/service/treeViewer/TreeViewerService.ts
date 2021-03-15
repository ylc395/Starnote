import { NotebookRepository } from 'domain/repository';
import { container, singleton } from 'tsyringe';
import { shallowReactive, shallowRef, ref } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import { KvStorage } from "utils/kvStorage";

const notebookRepository = container.resolve(NotebookRepository);

export type TreeItemId = Notebook['id'] | Note['id'];
type TreeItem = Notebook | Note;

@singleton()
export class TreeViewerService {
  readonly root: Ref<Notebook | null> = shallowRef(null);
  private readonly itemsKV = new KvStorage();
  selectedIds: Ref<(Notebook['id'] | Note['id'])[]> = ref([]);
  get selectedItem(): Notebook | Note | null {
    const firstSelectedItemId = this.selectedIds.value[0];
    return firstSelectedItemId ? this.itemsKV.getItem(firstSelectedItemId): null
  }
  expandedIds: Ref<Notebook['id'][]> = ref([]);
  constructor() {
    this.init();
  }
  async init() {
    notebookRepository.addListener('itemFetched', this.putTreeItemsInCache, this);
    this.root.value = await notebookRepository.queryOrCreateRootNotebook();
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

  getSelectedNotebook() {
    if (!this.selectedItem) {
      return null;
    }

    if (this.selectedItem instanceof Notebook) {
      return this.selectedItem;
    }

    return this.itemsKV.getItem(this.selectedItem.notebookId.value, Notebook)
  }

  async expandNotebook(notebookId: Notebook['id'], expandParent = true) {
    const notebook = this.itemsKV.getItem(notebookId, Notebook);

    if (!notebook.children.value) {
      await this.loadChildrenOf(notebookId); 
    }

    const hasParent = notebook.parentId.value && notebook.parentId.value !== this.root.value?.id

    if (hasParent && expandParent) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this.expandNotebook(notebook.parentId.value!, true);
    }

    if (!this.expandedIds.value.includes(notebookId)) {
      this.expandedIds.value.push(notebookId);
      this.expandedIds.value = [...this.expandedIds.value];
    }
  }
}
