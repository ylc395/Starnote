import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { EventEmitter } from 'eventemitter3';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { languages } from '@codemirror/language-data';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { history } from '@codemirror/history';
import { Previewer } from './preview';
import { statusbar, toolbar } from './panel/bar';
import { Linter } from './linter';
import type { BarItem } from './panel/bar';

export enum Events {
  DocChanged = 'change:doc',
  StateChanged = 'change:state',
  ContentSet = 'set:content',
  FullscreenChanged = 'change:fullscreen',
}
export interface EditorOptions {
  el: HTMLElement;
  classNamePrefix?: string;
  value?: string;
  toolbar?: BarItem[];
  statusbar?: BarItem[];
}

export class Editor extends EventEmitter {
  readonly view: EditorView;
  private previewer: Previewer;
  private linter?: Linter;

  get options() {
    return {
      value: '',
      toolbar: [] as BarItem[],
      statusbar: [] as BarItem[],
      classNamePrefix: '',
      ...this.userOptions,
    };
  }

  constructor(
    private readonly userOptions: EditorOptions,
    textlintWorker?: Worker,
  ) {
    super();
    this.view = new EditorView({ parent: this.options.el });

    if (textlintWorker) {
      this.linter = new Linter(textlintWorker);
    }

    this.setState(this.options.value);
    this.previewer = new Previewer(this);
    this.view.dom.style.height = '100%';
    this.view.dom.style.outline = 'none';
    this.view.dom.style.backgroundColor = '#fff';
  }

  setContent(text: string) {
    this.setState(text);
    this.emit(Events.ContentSet, text);
  }

  getContent() {
    return this.view.state.doc.toJSON().join('\n');
  }

  destroy() {
    this.previewer.destroy();
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }

  toggleLayout() {
    if (!this.previewer) {
      throw new Error('no previewer when toggle layout');
    }

    this.previewer.toggleLayout();
  }

  toggleFullscreen() {
    const dom = this.view.dom;

    if (dom.style.getPropertyValue('position') === 'fixed') {
      dom.style.position = '';
      dom.style.top = '';
      dom.style.bottom = '';
      dom.style.right = '';
      dom.style.left = '';
      this.emit(Events.FullscreenChanged, false);
    } else {
      dom.style.setProperty('position', 'fixed', 'important');
      dom.style.top = '0px';
      dom.style.bottom = '0px';
      dom.style.right = '0px';
      dom.style.left = '0px';
      this.emit(Events.FullscreenChanged, true);
    }
  }

  private setState(content: string) {
    const extensions = [];
    const { statusbar: statusbarItems, toolbar: toolbarItems } = this.options;

    if (statusbarItems.length > 0) {
      extensions.push(statusbar(this));
    }

    if (toolbarItems.length > 0) {
      extensions.push(toolbar(this));
    }

    if (this.linter) {
      extensions.push(this.linter.toExtension());
    }

    this.view.setState(
      EditorState.create({
        doc: content,
        extensions: [
          history(),
          markdown({
            // with GFM and some other extensions enabled
            // @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
            base: markdownLanguage,
            codeLanguages: languages,
            addKeymap: false,
          }),
          defaultHighlightStyle,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.emit(
                Events.DocChanged,
                update.state.doc.toJSON().join('\n'),
              );
            } else {
              this.emit(Events.StateChanged, update);
            }
          }),
          ...extensions,
        ],
      }),
    );
  }
}
