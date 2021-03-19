import { computed, effect, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
import {
  NotebookRepository,
  NoteRepository,
  QueryEntityTypes,
} from 'domain/repository';
import { container } from 'tsyringe';
import { NotebookTreeService } from './NotebookTreeService';

const notebookRepository = container.resolve(NotebookRepository);
const noteRepository = container.resolve(NoteRepository);

export class NoteListService {
  constructor(private readonly notebookTree: NotebookTreeService) {
    this.init();
  }
  readonly notes: Ref<Note[]> = shallowRef([]);
  readonly notebook = computed(() => {
    const selected = this.notebookTree.selectedItem.value;
    return selected instanceof Notebook ? selected : null;
  });
  readonly newNoteDisabled = computed(() => {
    return this.notebook.value?.isRoot ?? true;
  });

  private init() {
    noteRepository.on('noteCreated', this.loadNotes, this);
    effect(this.loadNotes.bind(this));
  }

  async loadNotes() {
    if (!this.notebook.value) {
      this.notes.value = [];
      return;
    }

    const { notes } = await notebookRepository.queryChildrenOf(
      this.notebook.value.id,
      QueryEntityTypes.Note,
    );
    this.notes.value = notes;
  }
}
