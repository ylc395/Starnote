/// <reference lib="WebWorker" />
const SCRIPTS_ROOT_PATH = '/wasm-git';
const GIT_REPO_DIR = '/git_repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(self as any).Module = {
  locateFile(path: string) {
    return `${SCRIPTS_ROOT_PATH}/${path}`;
  },
  print(text: string) {
    self.postMessage({ event: 'stdout', data: text });
  },
};

importScripts(`${SCRIPTS_ROOT_PATH}/lg2.js`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Module: any;
Module.onRuntimeInitialized = () => {
  const lg = Module;
  self.addEventListener('message', ({ data: [action, ...args] }) => {
    if (!action) {
      return;
    }

    if (action === 'init') {
      FS.writeFile(
        '/home/web_user/.gitconfig',
        '[user]\n' + 'name = Test User\n' + 'email = test@example.com',
      );
      FS.mkdir(GIT_REPO_DIR);
      FS.mount(NODEFS, { root: args[0] }, GIT_REPO_DIR);
      FS.chdir(GIT_REPO_DIR);
      lg.callMain(['init', '.']);
    } else {
      lg.callMain([action, ...args]);
    }

    self.postMessage({ event: 'done' });
  });

  self.postMessage({ event: 'ready' });
};
