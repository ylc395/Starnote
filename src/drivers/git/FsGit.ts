import { container } from 'tsyringe';
import { mapValues, groupBy, compact } from 'lodash';
import { outputFile, pathExists, ensureDir, remove, move } from 'fs-extra';
import { join as pathJoin } from 'path';
import { GitStatusMark, Note, Notebook, NOTE_SUFFIX } from 'domain/entity';
import type { ItemTree, TreeItem } from 'domain/entity';
import { NOTE_DAO_TOKEN } from 'domain/repository';
import type { Git } from 'domain/service/RevisionService';
import { APP_DIRECTORY } from 'drivers/env';

const GIT_DIR = pathJoin(APP_DIRECTORY, 'git_repository');
const ITEM_DIR = 'notes';

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
    return new Promise((resolve) => {
      let output = '';

      const callback = ({
        data: { event, data },
      }: {
        data: { event: string; data: string };
      }) => {
        if (event === 'stdout') {
          output += `\n${data}`;
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
          outputFile(FsGit.getItemFsPath(item), indexedContents[item.id]),
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
              FsGit.getItemFsPath(item.indexNote.value),
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
    const firstInit = !(await pathExists(pathJoin(GIT_DIR, '.git')));
    await this.call(['init', GIT_DIR]);

    if (!firstInit) {
      return;
    }

    await this.treeToFiles(tree);
    await this.call(['add', '.']);
  }

  async clone(url: string) {
    await this.call(['clone', url]);
  }

  async deleteFileByItem(item: TreeItem) {
    // "git rm" doesn't work, so we have to use "rm & git add"
    await remove(FsGit.getItemFsPath(item));
    await this.call(['add', FsGit.getItemFsPath(item, true)]);
  }

  async noteToFile(note: Note) {
    await outputFile(FsGit.getItemFsPath(note), note.content.value);
    await this.call(['add', FsGit.getItemFsPath(note, true)]);
  }

  async moveItem(
    item: TreeItem,
    { parent: oldParent, title: oldTitle }: { parent: Notebook; title: string },
  ) {
    const fileName = Note.isA(item) ? `${oldTitle}${NOTE_SUFFIX}` : oldTitle;
    const oldPath = pathJoin(FsGit.getItemFsPath(oldParent), fileName);
    const oldVirtualPath = pathJoin(
      FsGit.getItemFsPath(oldParent, true),
      fileName,
    );

    // "git mv" doesn't work, so we have to use "mv & git add"
    await move(oldPath, FsGit.getItemFsPath(item));
    await this.call(['add', oldVirtualPath]);
    await this.call(['add', FsGit.getItemFsPath(item, true)]);
  }

  async getStatus() {
    const statuses = compact(
      (await this.call(['status', '--porcelain'])).split('\n'),
    );

    return statuses.map((status) => {
      const marks = status.slice(0, 2);
      const src = status.slice(3).replace(`${ITEM_DIR}/`, '');

      return { file: src, status: marks[0] as GitStatusMark };
    });
  }

  async commit(msg: string) {
    await this.call(['commit', '-m', msg]);
  }

  private static getItemFsPath(item: TreeItem, virtual = false) {
    const TREE_ITEM_DIR = pathJoin(virtual ? '.' : GIT_DIR, ITEM_DIR);

    if (!item.parent) {
      return TREE_ITEM_DIR;
    }

    const path = pathJoin(TREE_ITEM_DIR, ...item.getPath().split('/').slice(1));

    return path;
  }
}
