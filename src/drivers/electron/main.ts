import 'reflect-metadata';
import 'drivers/dataSource/ipc/mainProcess';
import { App } from './App';

const myApp = new App();
myApp.start();
