import { IS_IN_ELECTRON } from 'drivers/constants';

export const dbReady = new Promise((resolve) => {
  if (IS_IN_ELECTRON) {
    import('./sqlite/index').then(({ tablesReady }) =>
      tablesReady.then(resolve),
    );
  }
});
