import { provide, onUnmounted } from 'vue';
import type { InjectionKey } from 'vue';
import type { TextlintWorkerCommandResponse } from '@textlint/script-compiler';

const worker = new Worker('textlint/textlint-worker.js', { type: 'module' });
const workerReady = new Promise((resolve) => {
  worker.addEventListener(
    'message',
    function cb(event: { data: TextlintWorkerCommandResponse }) {
      if (event.data.command === 'init') {
        resolve(worker);
        worker.removeEventListener('message', cb);
      } else {
        throw new Error('wrong lint worker init timing');
      }
    },
  );
});

export const token: InjectionKey<Promise<Worker>> = Symbol();
export function useLintWorker() {
  provide(token, workerReady);

  onUnmounted(() => {
    worker.terminate();
  });
}
