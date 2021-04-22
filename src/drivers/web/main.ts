import 'reflect-metadata';
import { ready as dbReady } from 'drivers/database';
import { ready as gitReady } from 'drivers/git';
import { ready as loggerReady } from 'drivers/logger';

import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

Promise.all([dbReady, gitReady, loggerReady]).then(() => {
  createApp(App).mount('#app');
});
