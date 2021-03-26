import 'reflect-metadata';
import './main.css';
import 'drivers/dataSource/ipc/rendererProcess';

import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
