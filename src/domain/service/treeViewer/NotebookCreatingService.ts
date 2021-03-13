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
    if (this.targetNotebook) {
      this.treeViewer.expandNotebook(this.targetNotebook.id);
    }
  }

  startCreating() {
    this.isCreating.value = true;
  }

  async stopCreating(isConfirmed: boolean) {
    this.isCreating.value = false;

    if (isConfirmed) {
      await this.createNotebook(this.title.value);
      this.expandTargetNotebook();
    }

    this.title.value = '';
  }

  async createNotebook(title: string) {
    const target = this.targetNotebook;

    if (!target) {
      return;
    }

    const newNotebook = new Notebook({
      parentId: target.id,
      title,
    });

    await notebookRepository.createNotebook(newNotebook);
    this.treeViewer.putTreeItemsInCache(newNotebook);

    if (target.children.value) {
      target.children.value.push(newNotebook);
    } else {
      await this.treeViewer.loadChildrenOf(newNotebook.id);
    }
  }
}
