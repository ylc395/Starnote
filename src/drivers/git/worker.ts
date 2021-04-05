/* eslint-disable @typescript-eslint/no-explicit-any */
const rootPath = '/wasm-git';

(self as any).Module = {
  locateFile(path: string) {
    return `${rootPath}/${path}`;
  },
  print(text: string) {
    // eslint-disable-next-line no-console
    console.log(text); // text must be outputted somehow, or we will get a error
    const _text = text;
    self.postMessage({ event: 'message', data: _text }, '*');
  },
};

importScripts(`${rootPath}/lg2.js`);

declare const Module: any;
Module.onRuntimeInitialized = () => {
  const lg = Module;

  FS.mkdir('/working');
  FS.mount(MEMFS, {}, '/working');
  FS.chdir('/working');

  FS.writeFile(
    '/home/web_user/.gitconfig',
    '[user]\n' + 'name = Test User\n' + 'email = test@example.com',
  );
};
