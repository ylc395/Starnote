import { computed, effect, shallowRef } from '@vue/reactivity';
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

export class NoteListService {
  readonly noteList: Ref<NoteList> = shallowRef(new NoteList());
  constructor(private readonly itemTreeService: ItemTreeService) {
    this.init();
  }

  private init() {
    noteRepository.on('noteCreated', (note: Note) => {
      this.noteList.value?.add(note);
    });

    effect(this.refreshNoteList.bind(this));
  }

  async refreshNoteList() {
    const selected = this.itemTreeService.itemTree.selectedItem.value;

    if (!Notebook.isA(selected)) {
      return;
    }

    const noteList = new NoteList(selected);
    const { notes } = await notebookRepository.queryChildrenOf(
      selected.id,
      QueryEntityTypes.Note,
    );

    noteList.notes.value = notes;
    this.noteList.value = noteList;
  }
}
