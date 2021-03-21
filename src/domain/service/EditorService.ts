import { NoteRepository } from 'domain/repository';
import { computed, effect } from '@vue/reactivity';
import { container } from 'tsyringe';
import { EditorManager, Note } from 'domain/entity';
import { selfish } from 'utils/index';
import { debounce } from 'lodash';
import { NoteListService } from './NoteListService';
import { NoteService } from './NoteService';

const noteRepository = container.resolve(NoteRepository);
export const token = Symbol();

export class EditorService {
  editorManager = selfish(new EditorManager());
  constructor() {
    this.keepActiveNoteSynced();
  }

  private keepActiveNoteSynced() {
    effect(() => {
      const activeEditor = this.editorManager.activeEditor.value;

      if (!activeEditor || !activeEditor.note.value) {
        return;
      }

      activeEditor.on(
        'saved',
        debounce(noteRepository.updateNote.bind(noteRepository), 500),
      );
    });
  }

  isEditing(noteId: Note['id']) {
    return computed(() => {
      return this.editorManager.activeEditor.value?.note.value?.id === noteId;
    });
  }

  async createAndOpenInEditor(
    noteListService: NoteListService,
    parentSynced: boolean,
  ) {
    const { noteList } = noteListService;

    if (!noteList.value?.notebook) {
      throw new Error('noteList is unavailable');
    }

    if (noteList.value.newNoteDisabled.value) {
      return;
    }

    const note = await NoteService.createEmptyNote(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      noteList.value.notebook,
      parentSynced,
    );

    this.openInEditor(note, true);
  }

  async openInEditor(note: Note, isNew = false) {
    if (!isNew) {
      await noteRepository.loadContent(note);
    }

    this.editorManager.openInEditor(note);
  }
}
