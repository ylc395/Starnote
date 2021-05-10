import { EditorView, ViewUpdate } from '@codemirror/view';
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

  private updateListener = (update: ViewUpdate) => {
    if (update.docChanged) {
      this.emit(Events.Updated, update.state.doc.toJSON().join('\n'));
    }
  };

  constructor(private readonly userOptions: EditorOptions) {
    super();

    this.view = new EditorView({
      parent: this.options.el,
      state: createState(this.options, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    });
  }

  setContent(text: string) {
    this.view.setState(
      createState({ ...this.options, value: text }, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    );
  }

  destroy() {
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }
}
