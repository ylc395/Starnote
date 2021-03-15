import { ref } from '@vue/reactivity';
import { TreeViewerService } from './TreeViewerService';
import { Notebook } from 'domain/entity';
import { NotebookRepository } from 'domain/repository';
import { container } from 'tsyringe';

const notebookRepository = container.resolve(NotebookRepository);
export class NotebookCreatingService {
  static token = Symbol();
  constructor(private treeViewer: TreeViewerService) {}
  title = ref('');
  isCreating = ref(false);
  get targetNotebook() {
    return this.treeViewer.getSelectedNotebook();
  }

  expandTargetNotebook() {
    if (!this.targetNotebook) {
      throw new Error('no target notebook when expand');
    }

    this.treeViewer.expandNotebook(this.targetNotebook.id, true);
  }

  startCreating() {
    if (!this.targetNotebook) {
      throw new Error('no target notebook when start creating');
    }

    this.isCreating.value = true;
  }

  async stopCreating(isConfirmed: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const target = this.targetNotebook!;

    this.isCreating.value = false;

    if (isConfirmed) {
      const newNotebook = await this.createNotebook(this.title.value);
      if (target.children.value) {
        target.children.value.push(newNotebook);
      }
      this.expandTargetNotebook();
    }

    this.title.value = '';
  }

  async createNotebook(title: string) {
    const target = this.targetNotebook;

    if (!target) {
      throw new Error('no target notebook when create');
    }

    const newNotebook = new Notebook({
      parentId: target.id,
      title,
    });

    await notebookRepository.createNotebook(newNotebook);
    this.treeViewer.putTreeItemsInCache(newNotebook);

    return newNotebook;
  }
}
