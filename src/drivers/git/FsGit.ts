import { container } from 'tsyringe';
import { mapValues, groupBy } from 'lodash';
import { outputFile, pathExists, ensureDir, remove } from 'fs-extra';
import { join as pathJoin } from 'path';
import { Note, Notebook } from 'domain/entity';
import type { ItemTree, TreeItem } from 'domain/entity';
import { NOTE_DAO_TOKEN } from 'domain/repository';
import type { Git } from 'domain/service/RevisionService';
import { APP_DIRECTORY } from 'drivers/env';

const GIT_DIR = pathJoin(APP_DIRECTORY, 'git_repository');
const TREE_ITEM_DIR = pathJoin(GIT_DIR, 'notes');
const NOTE_SUFFIX = '.md';

export class FsGit implements Git {
  private readonly noteDao = container.resolve(NOTE_DAO_TOKEN);
  private readonly worker = new Worker('./worker.ts', { type: 'module' });
  private workerReady: Promise<void>;
  constructor() {
    this.workerReady = new Promise((resolve) => {
      const readyCallback = ({
        data: { event },
      }: {
        data: { event: string };
      }) => {
        if (event === 'ready') {
          resolve();
          this.worker.removeEventListener('message', readyCallback);
        }
      };
      this.worker.addEventListener('message', readyCallback);
    });
  }

  private call(args: string[]): Promise<void> {
    return new Promise((resolve) => {
      const callback = ({ data: { event } }: { data: { event: string } }) => {
        this.worker.removeEventListener('message', callback);
        if (event === 'done') {
          resolve();
        }
      };
      this.worker.addEventListener('message', callback);
      this.workerReady.then(() => {
        this.worker.postMessage(args);
      });
    });
  }
  private treeToFiles(tree: ItemTree) {
    const { root } = tree;
    const promises: Promise<void>[] = [];

    type IndexedContents = Record<string, string>;

    const travel = async (
      item: TreeItem,
      path: string,
      indexedContents: IndexedContents,
    ) => {
      let _path = pathJoin(path, item.title.value);

      if (Note.isA(item)) {
        promises.push(
          outputFile(`${_path}${NOTE_SUFFIX}`, indexedContents[item.id]),
        );
      }

      if (Notebook.isA(item)) {
        if (item.isRoot) {
          _path = TREE_ITEM_DIR;
        }

        const contents = await this.noteDao.all({ parentId: item.id }, [
          'content',
          'id',
        ]);

        const indexedContents = mapValues(
          groupBy(contents, 'id'),
          (val) => val[0].content,
        ) as IndexedContents;

        if (item.indexNote.value) {
          promises.push(
            outputFile(
              pathJoin(_path, item.indexNote.value.title.value),
              indexedContents[item.indexNote.value.id],
            ),
          );
        }

        const children = item.children.value;

        if (children) {
          children.forEach((item) => travel(item, _path, indexedContents));
        }
      }
    };

    travel(root, GIT_DIR, {});

    return Promise.all(promises).then(() => undefined);
  }

  async init(tree: ItemTree) {
    await ensureDir(GIT_DIR);

    if (!(await pathExists(pathJoin(GIT_DIR, '.git')))) {
      await this.treeToFiles(tree);
    }

    this.call(['init', GIT_DIR]);
  }

  clone(url: string) {
    return this.call(['clone', url]);
  }

  deleteFileByItem(item: TreeItem) {
    return remove(FsGit.getItemPath(item));
  }

  noteToFile(note: Note) {
    return outputFile(FsGit.getItemPath(note), note.content.value);
  }

  private static getItemPath(item: TreeItem) {
    const [, ...ancestors] = item.ancestors;
    const path = pathJoin(
      TREE_ITEM_DIR,
      ...ancestors.map(({ title }) => title.value),
      Note.isA(item) ? `${item.title.value}${NOTE_SUFFIX}` : item.title.value,
    );

    return path;
  }
}
