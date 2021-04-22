import Logger from 'js-logger';
import { container } from 'tsyringe';
import { token } from 'domain/service/LoggerService';
import { IS_IN_ELECTRON } from 'utils/env';

const defaultHandler = Logger.createDefaultHandler();
export const ready: Promise<void> = (IS_IN_ELECTRON
  ? new Promise<void>((resolve) => {
      import(/* webpackChunkName: "electron-env" */ './fsHandler').then(
        ({ writeToFile, removed }) => {
          Logger.setHandler((messages, context) => {
            defaultHandler(messages, context);
            writeToFile(messages as [string, string]);
          });
          removed.then(resolve);
        },
      );
    })
  : Promise.resolve()
).then(() => {
  container.registerInstance(token, Logger);
});
