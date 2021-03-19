import { NoteListService } from 'domain/service/NoteListService';
import { NotebookTreeService, token } from 'domain/service/NotebookTreeService';
import { NoteService } from 'domain/service/NoteService';
import { computed, inject } from 'vue';

export function useNoteList() {
  const notebookTreeService = inject<NotebookTreeService>(token)!;
  const noteListService = new NoteListService(notebookTreeService);

  return {
    notes: noteListService.notes,
    goBack: notebookTreeService.historyBack,
    disabledNewNote: computed(() => {
      return noteListService.notebook.value?.isRoot ?? true;
    }),
    disabledGoBack: computed(() => {
      return notebookTreeService.isEmptyHistory.value;
    }),
    createNote: () => {
      const notebook = noteListService.notebook.value;

      if (notebook && !notebook.isRoot) {
        NoteService.createEmptyNote(notebook);
      }
    },
  };
}
