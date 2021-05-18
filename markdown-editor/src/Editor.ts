import { EditorView, ViewUpdate } from '@codemirror/view';
import { EventEmitter } from 'eventemitter3';
import { createState } from './state';
import { EditorOptions } from './types';
import { Previewer } from './Previewer';

export enum Events {
  Updated = 'Updated',
}

export class Editor extends EventEmitter {
  private readonly _view: EditorView;

  get view() {
    return this._view;
  }

  get el() {
    return this.options.el;
  }

  private readonly previewer: Previewer;
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

    this._view = new EditorView({
      parent: this.options.el,
      state: createState(this.options, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    });

    this._view.dom.style.height = '100%';

    this.previewer = new Previewer({
      editor: this,
      text: this.options.value,
    });
  }

  setContent(text: string) {
    this._view.setState(
      createState({ ...this.options, value: text }, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    );
    this.previewer.render(text);
  }

  destroy() {
    this._view.destroy();
  }

  focus() {
    this._view.focus();
  }
}
