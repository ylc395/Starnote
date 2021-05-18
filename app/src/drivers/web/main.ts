import 'reflect-metadata';
import 'drivers/git';
import { ready as dbReady } from 'drivers/database';
import logger from 'drivers/logger';

import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

Promise.all([dbReady]).then(() => {
  const app = createApp(App);
  app.config.errorHandler = (err, vm, info) => {
    logger.error('vue', { err, info });
  };
  app.config.warnHandler = (msg, vm, trace) => {
    logger.warn('vue', { msg, trace });
  };
  app.mount('#app');
});
