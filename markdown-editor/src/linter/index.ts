import type {
  TextlintWorkerCommandResponse,
  TextlintWorkerCommandMergeConfig,
  TextlintWorkerCommandResponseLint,
  TextlintWorkerCommandResponseFix,
} from '@textlint/script-compiler';
import { Editor, Events as EditorEvents } from '../editor';
import debounce from 'lodash.debounce';

export class Linter {
  private busy: Promise<void>;
  constructor(private editor: Editor, private readonly worker: Worker) {
    this.busy = new Promise((resolve) => {
      const readyCallback = (event: {
        data: TextlintWorkerCommandResponse;
      }) => {
        if (event.data.command === 'init') {
          resolve();
          this.worker.removeEventListener('message', readyCallback);
        } else {
          throw new Error('wrong init timing');
        }
      };

      this.worker.addEventListener('message', readyCallback);
    });

    this.lint();
    this.editor.on(EditorEvents.DocChanged, this.lint);
    this.editor.on(EditorEvents.ContentSet, this.lint);
  }

  private call(command: 'lint'): Promise<TextlintWorkerCommandResponseLint>;
  private call(command: 'fix'): Promise<TextlintWorkerCommandResponseFix>;
  private call(
    command: 'merge-config',
    rc: Record<string, unknown>,
  ): Promise<TextlintWorkerCommandMergeConfig>;
  private call(
    command: 'merge-config' | 'lint' | 'fix',
    payload?: Record<string, unknown>,
  ) {
    const task = new Promise((resolve) => {
      const resultCallback = (event: {
        data: TextlintWorkerCommandResponse;
      }) => {
        if (event.data.command !== 'init') {
          resolve(event.data.result);
        } else {
          throw new Error('wrong order for init call');
        }

        this.worker.removeEventListener('message', resultCallback);
      };

      this.busy = this.busy.then(() => {
        this.worker.addEventListener('message', resultCallback);
        this.worker.postMessage({
          command,
          ...(command === 'merge-config'
            ? { textlintrc: payload }
            : { text: this.editor.getContent(), ext: '.md' }),
        });
        return task as Promise<void>;
      });
    });

    return task;
  }

  readonly lint: () => void = debounce(async () => {
    const result = await this.call('lint');
    //todo: editor display
    // eslint-disable-next-line no-console
    console.log(result);
  }, 3000);

  fix() {
    return this.call('fix');
  }

  mergeConfig(rc: Record<string, unknown>) {
    return this.call('merge-config', rc);
  }

  destroy() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.lint as any).cancel();
    this.editor.off(EditorEvents.DocChanged, this.lint);
  }
}
