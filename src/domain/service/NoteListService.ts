import { effect, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import {
  NotebookRepository,
  NoteRepository,
  QueryEntityTypes,
} from 'domain/repository';
import { container } from 'tsyringe';
import { ItemTreeService } from './ItemTreeService';
import { NoteList } from 'domain/entity/NoteList';

const notebookRepository = container.resolve(NotebookRepository);
const noteRepository = container.resolve(NoteRepository);

export const token = Symbol();
export class NoteListService {
  readonly noteList: Ref<NoteList> = shallowRef(new NoteList());
  constructor(private readonly itemTreeService: ItemTreeService) {
    this.init();
  }

  private init() {
    noteRepository.on('noteCreated', this.addNote, this);
    effect(this.refreshNoteList.bind(this));
  }

  private addNote(note: Note) {
    if (note.parentId.value === this.noteList.value.notebook?.id) {
      this.noteList.value.add(note);
    }
  }

  moveTo(noteId: Note['id'], notebook: Notebook) {
    const note = this.noteList.value.moveTo(noteId, notebook);

    noteRepository.updateNote(note);
  }

  async refreshNoteList() {
    const selected = this.itemTreeService.itemTree.selectedItem.value;

    if (!Notebook.isA(selected)) {
      return;
    }

    this.noteList.value = new NoteList(selected);

    const { notes } = await notebookRepository.queryChildrenOf(
      selected.id,
      QueryEntityTypes.Note,
    );

    notes.forEach(this.addNote.bind(this));
  }
}
