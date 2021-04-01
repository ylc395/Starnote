import { computed, createVNode, inject, provide } from 'vue';
import { Modal } from 'ant-design-vue';
import { WarningFilled } from '@ant-design/icons-vue';
import { useContextmenu as useCommonContextmenu } from 'drivers/web/components/Contextmenu/useContextmenu';
import { token as notebookCreatorToken } from '../TreeViewer/ItemTree/NotebookCreator/useNotebookCreator';
import { token as renameToken } from '../TreeViewer/ItemTree/Renamer/useRename';
import { Notebook, Note, TreeItem, ViewMode } from 'domain/entity';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { StarService, token as starToken } from 'domain/service/StarService';

export const token = Symbol();

export function useContextmenu<T extends TreeItem>() {
  const notebookCreator = inject(notebookCreatorToken, null); // 在 NoteList 中时，将得到 null
  const renamer = inject(renameToken, null);
  const { open, context } = useCommonContextmenu<T>();
  const {
    createNote,
    createIndexNote,
    deleteItem,
    itemTree: { mode },
  } = inject<ItemTreeService>(itemTreeToken)!;
  const { addStar, isStar } = inject<StarService>(starToken)!;

  const handleClick = ({ key }: { key: string }) => {
    const _context = context.value;
    const useModal = (callback: () => void) => {
      Modal.confirm({
        title: `确认删除？`,
        okType: 'danger' as const,
        icon: createVNode(WarningFilled),
        okText: '确认',
        cancelText: '取消',
        width: 300,
        closable: false,
        onOk: callback,
      });
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
        useModal(() => deleteItem(_context as TreeItem));
        return;
      case 'deleteIndexNote':
        useModal(() => deleteItem((_context as Notebook).indexNote.value!));
        return;
      case 'star':
        addStar(_context as Note);
        return;
      default:
        break;
    }
  };

  const service = {
    open,
    context,
    type: computed(() => {
      return Notebook.isA(context.value) ? 'notebook' : 'note';
    }),
    handleClick,
    showSortMenu: computed(() => mode.value === ViewMode.OneColumn),
    isWithIndexNote: computed(() => {
      return Notebook.isA(context.value) && !!context.value.indexNote.value;
    }),
    isStar: computed(() => Note.isA(context.value) && isStar(context.value)),
  };

  provide(token, service);

  return service;
}
