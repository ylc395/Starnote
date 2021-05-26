import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { EventEmitter } from 'eventemitter3';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { languages } from '@codemirror/language-data';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { history } from '@codemirror/history';
import { showPanel } from '@codemirror/panel';
import { Previewer } from './preview';
import { statusbar, toolbar } from './panel/bar';
import type { BarItem } from './panel/bar';

export enum Events {
  DocChanged = 'change:doc',
  StateChanged = 'change:state',
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
  private previewer: Previewer | null = null;
  get options() {
    return {
      value: '',
      toolbar: [] as BarItem[],
      statusbar: [] as BarItem[],
      classNamePrefix: '',
      ...this.userOptions,
    };
  }

  constructor(private readonly userOptions: EditorOptions) {
    super();

    this.view = new EditorView({ parent: this.options.el });
    this.setState(this.options.value);
    this.view.dom.style.height = '100%';
    this.view.dom.style.outline = 'none';
    this.loadPreviewer(this.options.value);
  }

  setContent(text: string) {
    this.setState(text);
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

  private setState(content: string) {
    const panels = [];
    const {
      statusbar: statusbarItems,
      toolbar: toolbarItems,
      classNamePrefix,
    } = this.options;

    if (statusbarItems.length > 0) {
      panels.push(
        showPanel.of(statusbar({ items: statusbarItems, classNamePrefix })),
      );
    }

    if (toolbarItems.length > 0) {
      panels.push(
        showPanel.of(toolbar({ items: toolbarItems, classNamePrefix })),
      );
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
          ...panels,
        ],
      }),
    );
  }
}
