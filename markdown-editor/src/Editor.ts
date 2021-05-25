import { EditorView, ViewUpdate } from '@codemirror/view';
import { EventEmitter } from 'eventemitter3';
import { createState } from './state';
import { EditorOptions } from './types';
import { Previewer } from './preview';

export enum Events {
  DocChanged = 'change:doc',
  StateChanged = 'change:state',
}

export class Editor extends EventEmitter {
  readonly view: EditorView;
  private previewer: Previewer | null = null;
  private get options() {
    return { value: '', toolbar: [], statusbar: [], ...this.userOptions };
  }

  private updateListener = (update: ViewUpdate) => {
    if (update.docChanged) {
      this.emit(Events.DocChanged, update.state.doc.toJSON().join('\n'));
    } else {
      this.emit(Events.StateChanged, update);
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

    this.view.dom.style.height = '100%';
    this.view.dom.style.outline = 'none';
    this.loadPreviewer(this.options.value);
  }

  setContent(text: string) {
    this.view.setState(
      createState({ ...this.options, value: text }, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    );
    this.loadPreviewer(text);
  }

  destroy() {
    this.previewer?.destroy();
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }

  loadPreviewer(text: string) {
    this.previewer?.destroy();
    this.previewer = new Previewer({ editor: this, text });
  }
}
