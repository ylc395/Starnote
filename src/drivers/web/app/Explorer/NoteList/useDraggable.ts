import { Note } from 'domain/entity';
import { inject } from 'vue';
import {
  ItemTreeService,
  token as itemTreeToken,
} from 'domain/service/ItemTreeService';
import { token as dragIconToken } from '../DragIcon/useDragIcon';

export function useDraggable() {
  const { noteIconRef } = inject(dragIconToken)!;
  const {
    itemTree: { movingItem },
  } = inject<ItemTreeService>(itemTreeToken)!;

  return {
    handleDragstart: (event: DragEvent, note: Note) => {
      const icon = noteIconRef.value;
      movingItem.value = note;
      event.dataTransfer!.setDragImage(icon!, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
    },
  };
}
