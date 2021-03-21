import { Note } from 'domain/entity';
import { inject } from 'vue';
import { token as dragIconToken } from '../DragIcon/useDragIcon';

export function useDraggable() {
  const { noteIconRef } = inject(dragIconToken)!;

  return {
    handleDragstart: (event: DragEvent, note: Note) => {
      const icon = noteIconRef.value;

      event.dataTransfer!.setDragImage(icon!, 30, 30);
      event.dataTransfer!.effectAllowed = 'move';
      event.dataTransfer!.setData('noteId', note.id);
    },
  };
}
