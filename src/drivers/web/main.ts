import 'reflect-metadata';
import { dbReady } from 'drivers/db';

import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

dbReady.then(() => {
  createApp(App).mount('#app');
});
