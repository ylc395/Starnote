import { NoteRepository } from 'domain/repository';
import { effect } from '@vue/reactivity';
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

  async createAndOpenEditor(
    noteListService: NoteListService,
    parentSynced: boolean,
  ) {
    const { newNoteDisabled, notebook } = noteListService;
    if (!newNoteDisabled.value) {
      const note = await NoteService.createEmptyNote(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        notebook.value!,
        parentSynced,
      );

      this.openEditor(note);
    }
  }

  async openEditor(note: Note) {
    await noteRepository.loadContent(note);
    this.editorManager.openNewEditor(note);
  }
}
