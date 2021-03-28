import { computed, createVNode, inject } from 'vue';
import { Modal } from 'ant-design-vue';
import { WarningFilled } from '@ant-design/icons-vue';
import {
  useContextmenu as useCommonContextmenu,
  token,
} from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from '../TreeViewer/ItemTree/NotebookCreator/useNotebookCreator';
import { token as renameToken } from '../TreeViewer/ItemTree/Renamer/useRename';
import { Notebook, TreeItem } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';

export function useContextmenu() {
  const notebookCreator = inject(notebookCreatorToken, null); // 在 NoteList 中时，将得到 null
  const renamer = inject(renameToken, null);
  const { context } = inject<ReturnType<typeof useCommonContextmenu>>(token)!;
  const { createNote, createIndexNote, deleteItem } = inject<ItemTreeService>(
    itemTreeToken,
  )!;

  const handleClick = ({ key }: { key: string }) => {
    const _context = context.value;
    const modalConfig = {
      title: `确认删除？`,
      okType: 'danger' as const,
      icon: createVNode(WarningFilled),
      okText: '确认',
      cancelText: '取消',
      width: 300,
      closable: false,
    };

    switch (key) {
      case 'createNotebook':
        notebookCreator?.startCreating(_context as Notebook);
        return;
      case 'createNote':
        createNote(_context as Notebook);
        return;
      case 'createIndexNote':
        createIndexNote(_context as Notebook);
        return;
      case 'rename':
        renamer?.startEditing(_context as TreeItem);
        return;
      case 'delete':
        Modal.confirm({
          ...modalConfig,
          onOk() {
            deleteItem(_context as TreeItem);
          },
        });
        return;
      case 'deleteIndexNote':
        Modal.confirm({
          ...modalConfig,
          onOk() {
            deleteItem((_context as Notebook).indexNote.value!);
          },
        });
        return;
      default:
        break;
    }
  };

  return {
    type: computed(() => {
      if (Notebook.isA(context.value)) {
        return 'notebook';
      }

      return 'note';
    }),
    context,
    handleClick,
  };
}
