import type { EditorView } from '@codemirror/view';
import type { Diagnostic } from '@codemirror/lint';
import type {
  TextlintWorkerCommandResponse,
  TextlintWorkerCommandResponseLint,
  TextlintWorkerCommandResponseFix,
} from '@textlint/script-compiler';

export class Linter {
  private busy = Promise.resolve();
  constructor(private readonly worker: Worker) {}
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
        } else if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            'lint worker should be initialize before passed into editor, or linter may miss some request',
          );
        }

        this.worker.removeEventListener('message', resultCallback);
      };

      this.busy = this.busy.then(() => {
        const isMergeConfig = command === 'merge-config';

        if (!isMergeConfig) {
          this.worker.addEventListener('message', resultCallback);
        }

        this.worker.postMessage({
          command,
          ...(isMergeConfig
            ? { textlintrc: payload }
            : { text: payload, ext: '.md' }),
        });

        return isMergeConfig ? Promise.resolve() : (task as Promise<void>);
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
