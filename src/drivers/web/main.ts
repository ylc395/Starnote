import 'reflect-metadata';
import './assets/tailwind.css';
import 'drivers/dataSource/ipc/rendererProcess';

import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
