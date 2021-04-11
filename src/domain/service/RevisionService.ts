import { container, InjectionToken } from 'tsyringe';
import {
  ItemTree,
  ItemTreeEvents,
  TreeItem,
  Note,
  EditorManager,
  EditorManagerEvents,
} from 'domain/entity';
import { debounce } from 'lodash';
export const GIT_TOKEN: InjectionToken<Git> = Symbol();

export interface Git {
  noteToFile(note: Note): Promise<void>;
  deleteFileByItem(item: TreeItem): Promise<void>;
  init(tree: ItemTree): Promise<void>;
  clone(url: string): Promise<void>;
}

export class RevisionService {
  private readonly itemTree = container.resolve(ItemTree);
  private readonly editorManager = container.resolve(EditorManager);
  private git = container.resolve(GIT_TOKEN);
  constructor() {
    this.itemTree.on(
      ItemTreeEvents.Deleted,
      this.git.deleteFileByItem,
      this.git,
    );

    this.editorManager.on(
      EditorManagerEvents.Sync,
      debounce(this.modifyNote.bind(this), 5000),
    );

    this.git.init(this.itemTree);
  }

  async modifyNote(note: Note) {
    await this.git.noteToFile(note);
  }
}
