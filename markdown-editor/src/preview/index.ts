import MarkdownIt from 'markdown-it';
import markdownItSourceMap from 'markdown-it-source-map';
import EventEmitter from 'eventemitter3';
import type { ViewUpdate } from '@codemirror/view';
import { Events as EditorEvents, Events } from '../Editor';
import type { Editor } from '../Editor';
import style from '../style.css';

interface PreviewerOption {
  text: string;
  editor: Editor;
}

export class Previewer extends EventEmitter {
  private readonly renderer = new MarkdownIt({ breaks: true }).use(
    markdownItSourceMap,
  );
  private readonly el = document.createElement('article');
  private readonly editor: Editor;
  constructor({ text, editor }: PreviewerOption) {
    super();

    this.editor = editor;
    this.editor.on(EditorEvents.StateChanged, this.highlightFocusedLine);
    this.editor.on(EditorEvents.DocChanged, this.render);
    this.initDom();
    this.render(text);
  }
  render = (text: string) => {
    this.el.innerHTML = this.renderer.render(text);
    this.emit('rendered');
  };

  private initDom() {
    const {
      view: { scrollDOM },
      containerEl,
    } = this.editor;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const topPanel = containerEl.querySelector('.cm-panels-top')!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bottomPanel = containerEl.querySelector('.cm-panels-bottom')!;

    this.el.className = style['previewer'];
    this.el.style.top = `${topPanel.clientHeight}px`;
    this.el.style.bottom = `${bottomPanel.clientHeight}px`;

    scrollDOM.after(this.el);
    scrollDOM.style.width = '50%';
  }

  private highlightFocusedLine = (update: ViewUpdate) => {
    const className = style['previewer-focused-line'];
    const ranges = update.state.selection.ranges;
    const focusedLineEls = ranges
      .map(({ head }) => update.state.doc.lineAt(head).number)
      .map((number) => {
        for (let i = number; i >= 1; i--) {
          const el = this.el.querySelector(`[data-source-line="${i}"]`);
          if (el) {
            return el;
          }
        }

        return null;
      });

    for (const el of this.el.querySelectorAll(`.${className}`)) {
      el.classList.remove(className);
    }

    for (const el of focusedLineEls) {
      if (el) {
        el.classList.add(className);
      }
    }
  };

  destroy() {
    this.editor.off(Events.StateChanged, this.highlightFocusedLine);
    this.editor.off(Events.DocChanged, this.render);
  }
}
