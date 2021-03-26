import {
  ItemTree,
  ItemTreeEvents,
  Note,
  Notebook,
  NoteWithoutParent,
  TreeItem,
} from 'domain/entity';
import {
  NotebookRepository,
  NoteEvents,
  NoteRepository,
} from 'domain/repository';
import { container } from 'tsyringe';
import { ItemTreeService } from './ItemTreeService';
import { NoteList } from 'domain/entity/NoteList';
import { EntityTypes } from 'domain/constant';

export const token = Symbol();
export class NoteListService {
  private readonly notebookRepository = container.resolve(NotebookRepository);
  private readonly noteRepository = container.resolve(NoteRepository);
  private itemTree: ItemTree;

  readonly noteList = new NoteList();
  constructor(itemTreeService: ItemTreeService) {
    this.itemTree = itemTreeService.itemTree;
    this.init();
  }

  private init() {
    this.noteRepository.on(NoteEvents.NoteCreated, this.addNote, this);
    this.itemTree.on(ItemTreeEvents.Selected, (item: TreeItem) => {
      if (Notebook.isA(item)) {
        this.loadNotesOf(item);
      }
    });
  }

  private addNote(note: NoteWithoutParent) {
    if (note.parentId.value !== this.noteList.notebook?.id) {
      return;
    }

    const noteInEditor = this.itemTree.editingNotes.value.find((n) =>
      n.isEqual(note),
    );
    this.noteList.add(noteInEditor || note);
  }

  moveTo(noteId: Note['id'], notebook: Notebook) {
    const note = this.noteList.moveTo(noteId, notebook);

    this.noteRepository.updateNote(note);
  }

  async loadNotesOf(notebook: Notebook) {
    const { notes } = await this.notebookRepository.queryChildrenOf(
      notebook.id,
      EntityTypes.Note,
    );

    this.noteList.load(notebook, []);
    notes.forEach((note) => this.addNote(note));
  }
}
