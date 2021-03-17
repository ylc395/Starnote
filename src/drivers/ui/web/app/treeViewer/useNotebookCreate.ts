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
    startCreating(isRoot = false) {
      if (!isRoot && !(treeViewerService.selectedItem instanceof Notebook)) {
        throw new Error('no target notebook!');
      }

      parent.value = isRoot
        ? treeViewerService.root.value
        : (treeViewerService.selectedItem as Notebook);
      isCreating.value = true;
    },
    async stopCreating(isConfirmed: boolean) {
      if (isConfirmed) {
        if (!parent.value) {
          throw new Error('no target notebook when stop creating');
        }

        await treeViewerService.expandNotebook(parent.value.id);
        const newNotebook = await notebookService.create(
          parent.value,
          title.value,
        );

        treeViewerService.setSelectedItem(newNotebook);
      }

      title.value = '';
      isCreating.value = false;
    },
  };
}

export const token: InjectionKey<
  ReturnType<typeof useNotebookCreate>
> = Symbol();
