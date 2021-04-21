import { container } from 'tsyringe';
import { mapValues, groupBy, compact, isUndefined } from 'lodash';
import { outputFile, ensureDir, remove, move, readFile } from 'fs-extra';
import { join as pathJoin } from 'path';
import fm from 'front-matter';
import {
  GitStatusMark,
  Note,
  Notebook,
  NOTE_SUFFIX,
  ItemTree,
  TIME_DATA_FORMAT,
} from 'domain/entity';
import type { TreeItem } from 'domain/entity';
import { NOTE_DAO_TOKEN } from 'domain/repository';
import type { Git } from 'domain/service/RevisionService';
import { APP_DIRECTORY } from 'drivers/env';
import dayjs from 'dayjs';

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

  private async treeToFiles(tree: ItemTree) {
    await remove(pathJoin(GIT_DIR, ITEM_DIR));

    const { root } = tree;
    const promises: Promise<void>[] = [];
    const contents = await this.noteDao.all(['content', 'id']);
    const indexedContents = mapValues(
      groupBy(contents, 'id'),
      (val) => val[0].content,
    );

    const travel = (item: TreeItem) => {
      if (Note.isA(item)) {
        promises.push(this.noteToFile(item, indexedContents[item.id]));
        return;
      }

      const indexNote = item.indexNote.value;
      const children = item.children.value;

      if (indexNote) {
        promises.push(
          this.noteToFile(indexNote, indexedContents[indexNote.id]),
        );
      }

      if (children) {
        children.forEach((item) => travel(item));
      }
    };

    travel(root);
    await Promise.all(promises);
  }

  async init(tree: ItemTree) {
    await ensureDir(GIT_DIR);
    await this.call(['init', GIT_DIR]);
    await this.treeToFiles(tree);
    await this.call(['add', '.']);
  }

  async clone(url: string) {
    await this.call(['clone', url]);
  }

  async deleteFileByItem(item: TreeItem) {
    // "git rm" doesn't work, so we have to use "rm & git add"
    await remove(FsGit.getItemFsPath(item));
    await this.call(['add', '.']);
  }

  async noteToFile(note: Note, content?: string) {
    await outputFile(
      FsGit.getItemFsPath(note),
      FsGit.noteContentFoFileContent(note, content),
    );

    // if this function is not called during init
    if (isUndefined(content)) {
      await this.call(['add', '.']);
    }
  }

  async moveItem(
    item: TreeItem,
    { parent: oldParent, title: oldTitle }: { parent: Notebook; title: string },
  ) {
    const fileName = Note.isA(item) ? `${oldTitle}${NOTE_SUFFIX}` : oldTitle;
    const oldPath = pathJoin(FsGit.getItemFsPath(oldParent), fileName);

    // "git mv" doesn't work, so we have to use "mv & git add"
    await move(oldPath, FsGit.getItemFsPath(item));
    await this.call(['add', '.']);
  }

  async getStatus() {
    const statuses = compact(
      (await this.call(['status', '--porcelain'])).split('\n'),
    );

    return statuses.map((status) => {
      const marks = status.slice(0, 2);
      const src = status.slice(3).replace(`${ITEM_DIR}/`, '/');

      return { file: src, status: marks[0] as GitStatusMark };
    });
  }

  async commit(msg: string) {
    await this.call(['commit', '-m', msg]);
  }

  async restore(path: string) {
    const file = `${ITEM_DIR}${path}`;
    await this.call(['checkout', '--', file]);
    const note = await FsGit.fileToNote(
      pathJoin(GIT_DIR, ITEM_DIR, ...path.split('/').slice(1)),
    );

    return note;
  }

  private static getItemFsPath(item: TreeItem, virtual = false) {
    const TREE_ITEM_DIR = virtual ? ITEM_DIR : pathJoin(GIT_DIR, ITEM_DIR);

    if (!item.parent) {
      return TREE_ITEM_DIR;
    }

    const path = virtual
      ? `${TREE_ITEM_DIR}${item.getPath()}`
      : pathJoin(TREE_ITEM_DIR, ...item.getPath().split('/').slice(1));

    return path;
  }

  private static noteContentFoFileContent(note: Note, content?: string) {
    const _content = note.content.value ?? content;

    if (isUndefined(_content)) {
      throw new Error('no content when write file');
    }

    const { userCreatedAt, sortOrder, id } = note.toDataObject();

    const frontmatter = [
      '---',
      [
        `id: ${id}`,
        `userCreatedAt: ${userCreatedAt}`,
        `sortOrder: ${sortOrder}`,
      ].join('\n'),
      '---',
    ].join('\n');

    return frontmatter.concat('\n', _content);
  }

  private static async fileToNote(file: string) {
    const fileContent = await readFile(file, 'utf-8');
    interface NoteFrontMatter {
      id: string;
      userCreatedAt: Date;
      sortOrder: number;
    }

    const { attributes, body: content } = fm<NoteFrontMatter>(fileContent);

    return {
      ...attributes,
      userCreatedAt: dayjs(attributes.userCreatedAt).format(TIME_DATA_FORMAT),
      title: ItemTree.getTitleWithoutSuffix(file),
      content,
    };
  }
}
