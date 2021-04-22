import { container } from 'tsyringe';
import { GIT_TOKEN } from 'domain/service/RevisionService';
import { IS_IN_ELECTRON } from 'utils/env';

export const ready: Promise<void> = new Promise((resolve) => {
  if (IS_IN_ELECTRON) {
    import(/* webpackChunkName: "electron-env" */ './FsGit').then(
      ({ FsGit }) => {
        container.registerSingleton(GIT_TOKEN, FsGit);
        resolve();
      },
    );
  }
});
