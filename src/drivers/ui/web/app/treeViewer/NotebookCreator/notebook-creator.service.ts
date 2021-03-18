import { InjectionKey, shallowRef, Ref, ref, provide } from 'vue';
import { TreeViewerService } from 'domain/service/TreeViewerService';
import { NotebookService } from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity';
import { selfish } from 'utils/index';

export class NotebookCreatorService {
  static token: InjectionKey<NotebookCreatorService> = Symbol();
  static setup(treeViewerService: TreeViewerService) {
    const service = selfish(new this(treeViewerService));

    provide(this.token, service);

    return service;
  }

  constructor(private readonly treeViewerService: TreeViewerService) {}
  private readonly notebookService = new NotebookService();
  readonly isCreating = ref(false);
  readonly title = ref('');
  readonly parent: Ref<Notebook | null> = shallowRef(null);

  startCreating(isRoot = false) {
    if (!isRoot && !(this.treeViewerService.selectedItem instanceof Notebook)) {
      throw new Error('no target notebook!');
    }

    this.parent.value = isRoot
      ? this.treeViewerService.root.value
      : (this.treeViewerService.selectedItem as Notebook);
    this.isCreating.value = true;
  }
  async stopCreating(isConfirmed: boolean) {
    if (isConfirmed) {
      if (!this.parent.value) {
        throw new Error('no target notebook when stop creating');
      }

      await this.treeViewerService.expandNotebook(this.parent.value.id);
      const newNotebook = await this.notebookService.create(
        this.parent.value,
        this.title.value,
      );

      this.treeViewerService.setSelectedItem(newNotebook);
    }

    this.title.value = '';
    this.isCreating.value = false;
  }
}
