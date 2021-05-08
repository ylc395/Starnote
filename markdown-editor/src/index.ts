import { EditorView } from '@codemirror/view';
import type { Transaction } from '@codemirror/state';
import { createState } from './state';
import { EditorOptions } from './types';
import { EventEmitter } from 'eventemitter3';

export enum Events {
  Updated = 'Updated',
}

export class Editor extends EventEmitter {
  private readonly view: EditorView;
  constructor(private readonly options: EditorOptions) {
    super();
    this.view = new EditorView({
      parent: options.el,
      state: createState(options),
      dispatch: (transaction: Transaction) => {
        if (transaction.docChanged) {
          this.emit(Events.Updated, transaction.newDoc.toString());
        }

        this.view.update([transaction]);
      },
    });
  }

  setContent(text: string) {
    this.view.setState(createState({ ...this.options, value: text }));
  }

  destroy() {
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }
}
