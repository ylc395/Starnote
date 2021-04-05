import EventEmitter from 'eventemitter3';

export enum GitEvents {
  Message = 'MESSAGE',
}

export class Git extends EventEmitter<GitEvents> {
  private readonly worker = new Worker('./worker.ts', { type: 'module' });
  constructor() {
    super();
    this.worker.addEventListener('message', ({ data }) => {
      this.emit(GitEvents.Message, data);
    });
  }
}
