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
  private get options() {
    return { value: '', toolbar: [], statusbar: [], ...this.userOptions };
  }

  constructor(private readonly userOptions: EditorOptions) {
    super();

    this.view = new EditorView({
      parent: this.options.el,
      state: createState(this.options),
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
