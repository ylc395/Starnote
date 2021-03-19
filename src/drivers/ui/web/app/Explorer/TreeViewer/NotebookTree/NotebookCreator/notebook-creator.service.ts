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
  readonly isCreating = ref(false);
  readonly title = ref('');
  readonly target: Ref<Notebook | null> = shallowRef(null);

  startCreating(target: Notebook): void;
  startCreating(isRoot: boolean): void;
  startCreating(target: Notebook | boolean = false) {
    if (Notebook.isA(target)) {
      this.target.value = target;
    } else {
      const selectedItem = this.notebookTree.selectedItem.value;

      if (!target && !Notebook.isA(selectedItem)) {
        throw new Error('no target notebook!');
      }

      this.target.value = target
        ? this.notebookTree.root.value
        : (selectedItem as Notebook);
    }

    this.isCreating.value = true;
  }

  async stopCreating(isConfirmed: boolean) {
    if (isConfirmed) {
      if (!this.target.value) {
        throw new Error('no target notebook when stop creating');
      }

      await this.notebookTree.expandNotebook(this.target.value.id);

      const newNotebook = await NotebookService.create(
        this.target.value,
        this.title.value,
      );

      this.notebookTree.setSelectedItem(newNotebook);
    }

    this.title.value = '';
    this.isCreating.value = false;
  }
}
