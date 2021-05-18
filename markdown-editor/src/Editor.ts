import { EditorView, ViewUpdate } from '@codemirror/view';
import { EventEmitter } from 'eventemitter3';
import { createState } from './state';
import { EditorOptions } from './types';
import { Previewer } from './Previewer';

export enum Events {
  Updated = 'Updated',
}

export class Editor extends EventEmitter {
  private readonly view: EditorView;
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

    const { editorEl, previewerEl } = this.initDom(this.options.el);

    this.previewer = new Previewer({
      editor: this,
      el: previewerEl,
      text: this.options.value,
    });

    this.view = new EditorView({
      parent: editorEl,
      state: createState(this.options, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    });
  }

  private initDom(rootEl: HTMLElement) {
    const containerEl = document.createElement('div');
    const editorEl = document.createElement('div');
    const previewerEl = document.createElement('div');

    editorEl.className = 'editor-editor';
    containerEl.append(editorEl, previewerEl);
    rootEl.append(containerEl);

    return { editorEl, previewerEl };
  }

  setContent(text: string) {
    this.view.setState(
      createState({ ...this.options, value: text }, [
        EditorView.updateListener.of(this.updateListener),
      ]),
    );
    this.previewer.render(text);
  }

  destroy() {
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }
}
