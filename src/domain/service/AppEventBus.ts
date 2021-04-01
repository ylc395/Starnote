import EventEmitter from 'eventemitter3';
import { singleton } from 'tsyringe';

@singleton()
export class AppEventBus extends EventEmitter<AppEvents> {}

export enum AppEvents {
  ITEM_DELETED = 'ITEM_DELETED',
}
