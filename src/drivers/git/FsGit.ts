import { container } from 'tsyringe';
import { mapValues, groupBy } from 'lodash';
import { outputFile, pathExists, ensureDir, remove, move } from 'fs-extra';
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

  private call(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';

      const callback = ({
        data: { event, data },
      }: {
        data: { event: string; data: string };
      }) => {
        if (event === 'output') {
          output += `\n${data}`;
        }

        if (event === 'error') {
          reject(data);
        }

        if (event === 'done') {
          resolve(output);
          this.worker.removeEventListener('message', callback);
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

    const travel = async (item: TreeItem, indexedContents: IndexedContents) => {
      if (Note.isA(item)) {
        promises.push(
          outputFile(FsGit.getItemPath(item), indexedContents[item.id]),
        );
      }

      if (Notebook.isA(item)) {
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
              FsGit.getItemPath(item.indexNote.value),
              indexedContents[item.indexNote.value.id],
            ),
          );
        }

        const children = item.children.value;

        if (children) {
          children.forEach((item) => travel(item, indexedContents));
        }
      }
    };

    travel(root, {});

    return Promise.all(promises).then(() => undefined);
  }

  async init(tree: ItemTree) {
    await ensureDir(GIT_DIR);

    if (!(await pathExists(pathJoin(GIT_DIR, '.git')))) {
      await this.treeToFiles(tree);
    }
    await this.call(['init', GIT_DIR]);
  }

  async clone(url: string) {
    await this.call(['clone', url]);
  }

  deleteFileByItem(item: TreeItem) {
    return remove(FsGit.getItemPath(item));
  }

  noteToFile(note: Note) {
    const path = FsGit.getItemPath(note);
    return outputFile(path, note.content.value);
  }

  moveItem(
    item: TreeItem,
    {
      parent: oldParent,
      title: oldTitle,
    }: { parent?: Notebook; title?: string },
  ) {
    const _oldParent = oldParent || item.parent;
    const _oldTitle = oldTitle || item.title.value;

    if (!_oldParent) {
      throw new Error('no old parent');
    }

    const oldPath = pathJoin(
      FsGit.getItemPath(_oldParent),
      Note.isA(item) ? `${_oldTitle}${NOTE_SUFFIX}` : _oldTitle,
    );

    return move(oldPath, FsGit.getItemPath(item));
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
