import 'reflect-metadata';
import { Database } from 'drivers/database';

import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

const db = new Database();
db.ready.then(() => {
  createApp(App).mount('#app');
});
