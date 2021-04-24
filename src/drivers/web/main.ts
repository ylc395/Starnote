import 'reflect-metadata';
import { ready as dbReady } from 'drivers/database';
import 'drivers/git';
import 'drivers/logger';

import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

Promise.all([dbReady]).then(() => {
  createApp(App).mount('#app');
});
