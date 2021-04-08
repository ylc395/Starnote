import { IS_IN_ELECTRON } from 'drivers/env';

export const dbReady = new Promise((resolve) => {
  if (IS_IN_ELECTRON) {
    import('./sqlite/index').then(({ tablesReady }) =>
      tablesReady.then(resolve),
    );
  }
});
