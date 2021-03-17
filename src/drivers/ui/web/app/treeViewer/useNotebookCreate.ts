import { InjectionKey, shallowRef, Ref, ref } from 'vue';
import { TreeViewerService } from 'domain/service/TreeViewerService';
import { NotebookService } from 'domain/service/NotebookService';
import { Notebook } from 'domain/entity';

export function useNotebookCreate(treeViewerService: TreeViewerService) {
  const notebookService = new NotebookService();
  const isCreating = ref(false);
  const title = ref('');
  const parent: Ref<Notebook | null> = shallowRef(null);

  return {
    title,
    isCreating,
    parent,
    startCreating(target = treeViewerService.root.value) {
      if (!target) {
        throw new Error('no target notebook when start creating');
      }

      parent.value = target;
      isCreating.value = true;
    },
    async stopCreating(isConfirmed: boolean) {
      if (isConfirmed) {
        if (!parent.value) {
          throw new Error('no target notebook when stop creating');
        }

        const newNotebook = await notebookService.create(
          parent.value,
          title.value,
        );

        treeViewerService.setSelectedItem(newNotebook);
        treeViewerService.expandNotebook(newNotebook.parentId.value);
      }

      title.value = '';
      isCreating.value = false;
    },
  };
}

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreate>
> = Symbol();
