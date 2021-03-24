import { effect, shallowRef } from '@vue/reactivity';
import type { Ref } from '@vue/reactivity';
import { Note, Notebook } from 'domain/entity';
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
import { isNull } from 'lodash';

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
    effect(this.refreshNoteList.bind(this));
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

  async createNoteAndOpenInEditor(parent: Notebook, parentSynced: boolean) {
    const newNote = Note.createEmptyNote(parent, parentSynced);

    await this.noteRepository.createNote(newNote);
    this.itemTreeService.itemTree.setSelectedItem(parent);
    this.editorService.openInEditor(newNote);
  }

  async refreshNoteList() {
    const selected = this.itemTreeService.itemTree.selectedItem.value;

    if (!Notebook.isA(selected)) {
      return;
    }

    this.noteList.value = new NoteList(selected);

    const { notes } = await this.notebookRepository.queryChildrenOf(
      selected.id,
      QueryEntityTypes.Note,
    );

    notes.forEach(this.addNote.bind(this));
  }
  static async loadContentOf(note: Note, forced = false) {
    if (!forced && !isNull(note.content.value)) {
      return;
    }

    const noteRepository = container.resolve(NoteRepository);
    const noteDo = await noteRepository.queryNoteById(note.id, ['content']);

    if (!noteDo) {
      throw new Error(`no note(${note.id}) to load content`);
    }

    note.content.value = noteDo.content ?? '';
  }
}
