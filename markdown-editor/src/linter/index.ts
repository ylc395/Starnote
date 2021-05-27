import type { EditorView } from '@codemirror/view';
import type { Diagnostic } from '@codemirror/lint';
import type {
  TextlintWorkerCommandResponse,
  TextlintWorkerCommandResponseLint,
  TextlintWorkerCommandResponseFix,
} from '@textlint/script-compiler';

export class Linter {
  private busy: Promise<void>;
  constructor(private readonly worker: Worker) {
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
  }

  private call(
    command: 'lint',
    text: string,
  ): Promise<TextlintWorkerCommandResponseLint>;
  private call(
    command: 'fix',
    text: string,
  ): Promise<TextlintWorkerCommandResponseFix>;
  private call(
    command: 'merge-config',
    rc: Record<string, unknown>,
  ): Promise<void>;
  private call(
    command: 'merge-config' | 'lint' | 'fix',
    payload?: string | Record<string, unknown>,
  ) {
    const task = new Promise((resolve) => {
      const resultCallback = (event: {
        data: TextlintWorkerCommandResponse;
      }) => {
        if (event.data.command !== 'init') {
          resolve(event.data);
        } else {
          throw new Error('wrong order for init call');
        }

        this.worker.removeEventListener('message', resultCallback);
      };

      this.busy = this.busy.then(() => {
        if (command !== 'merge-config') {
          this.worker.addEventListener('message', resultCallback);
        }

        this.worker.postMessage({
          command,
          ...(command === 'merge-config'
            ? { textlintrc: payload }
            : { text: payload, ext: '.md' }),
        });
        return command === 'merge-config'
          ? Promise.resolve()
          : (task as Promise<void>);
      });
    });

    return task;
  }

  async lint(view: EditorView): Promise<Diagnostic[]> {
    const { result } = await this.call(
      'lint',
      view.state.doc.toJSON().join('\n'),
    );

    return result.messages.map(({ severity, index, message, ruleId }) => {
      const severityMap = ['info', 'warning', 'error'] as const;

      return {
        from: index,
        to: index,
        message,
        source: ruleId,
        severity: severityMap[severity],
      };
    });
  }

  mergeConfig(rc: Record<string, unknown>) {
    return this.call('merge-config', rc);
  }
}
