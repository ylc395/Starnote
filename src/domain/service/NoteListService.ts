import { shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { ItemTreeEvents, Note, Notebook } from 'domain/entity';
import {
  NotebookRepository,
  NoteEvents,
  NoteRepository,
  QueryEntityTypes,
} from 'domain/repository';
import { container } from 'tsyringe';
import { ItemTreeService } from './ItemTreeService';
import { EditorService } from './EditorService';
import { NoteList } from 'domain/entity/NoteList';

export const token = Symbol();
export class NoteListService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);

  readonly noteList: Ref<NoteList> = shallowRef(new NoteList());
  constructor(
    private readonly itemTreeService: ItemTreeService,
    private readonly editorService: EditorService,
  ) {
    this.init();
  }

  private init() {
    this.noteRepository.on(NoteEvents.NoteCreated, this.addNote, this);
    this.itemTreeService.itemTree.on(ItemTreeEvents.Selected, ({ actual }) =>
      this.loadNotesOf(actual),
    );
  }

  private addNote(note: Note) {
    if (note.parentId.value !== this.noteList.value.notebook?.id) {
      return;
    }
    // todo: 目前是从 editors 里找 note，以确保 noteList 中的 note 和 editor 中的是同一个。再想想有没有更好的做法
    const noteInEditor = this.editorService.getNoteById(note.id);
    this.noteList.value.add(noteInEditor || note);
  }

  moveTo(noteId: Note['id'], notebook: Notebook) {
    const note = this.noteList.value.moveTo(noteId, notebook);

    this.noteRepository.updateNote(note);
  }

  async loadNotesOf(notebook: Notebook) {
    this.noteList.value = new NoteList(notebook);

    const { notes } = await this.notebookRepository.queryChildrenOf(
      notebook.id,
      QueryEntityTypes.Note,
    );

    notes.forEach((note) => this.addNote(note));
  }
}
