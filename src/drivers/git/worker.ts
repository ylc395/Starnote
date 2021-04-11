/// <reference lib="WebWorker" />
const rootPath = '/wasm-git';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(self as any).Module = {
  locateFile(path: string) {
    return `${rootPath}/${path}`;
  },
  print(text: string) {
    // eslint-disable-next-line no-console
    console.log(text); // text must be outputted somehow, or we will get a error
    const _text = text;
    self.postMessage({ event: 'output', data: _text });
  },
};

importScripts(`${rootPath}/lg2.js`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Module: any;
Module.onRuntimeInitialized = () => {
  const lg = Module;
  self.addEventListener('message', ({ data: [action, ...args] }) => {
    if (!action) {
      return;
    }

    if (action === 'init') {
      FS.mkdir('/git_repository');
      FS.mount(NODEFS, { root: args[0] }, '/git_repository');
      FS.chdir('/git_repository');
      lg.callMain(['init', '/git_repository/.git']);
    } else {
      lg.callMain([action, ...args]);
    }

    self.postMessage({ event: 'done' });
  });

  self.postMessage({ event: 'ready' });
};
