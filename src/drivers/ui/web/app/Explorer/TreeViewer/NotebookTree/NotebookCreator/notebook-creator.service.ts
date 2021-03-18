import { InjectionKey, shallowRef, Ref, ref, provide, inject } from 'vue';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { NotebookService } from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity';
import { selfish } from 'utils/index';

export class NotebookCreatorService {
  static token: InjectionKey<NotebookCreatorService> = Symbol();
  static setup() {
    const service = selfish(new this());
    provide(this.token, service);

    return service;
  }

  private readonly notebookTree = inject<NotebookTreeService>(token)!;
  private readonly notebookService = new NotebookService();
  readonly isCreating = ref(false);
  readonly title = ref('');
  readonly parent: Ref<Notebook | null> = shallowRef(null);

  startCreating(isRoot = false) {
    const selectedItem = this.notebookTree.selectedItem.value;

    if (!isRoot && !Notebook.isA(selectedItem)) {
      throw new Error('no target notebook!');
    }

    this.parent.value = isRoot
      ? this.notebookTree.root.value
      : (selectedItem as Notebook);
    this.isCreating.value = true;
  }
  async stopCreating(isConfirmed: boolean) {
    if (isConfirmed) {
      if (!this.parent.value) {
        throw new Error('no target notebook when stop creating');
      }

      await this.notebookTree.expandNotebook(this.parent.value.id);
      const newNotebook = await this.notebookService.create(
        this.parent.value,
        this.title.value,
      );

      this.notebookTree.setSelectedItem(newNotebook);
    }

    this.title.value = '';
    this.isCreating.value = false;
  }
}
