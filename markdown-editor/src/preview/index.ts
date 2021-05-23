import MarkdownIt from 'markdown-it';
import EventEmitter from 'eventemitter3';
import type { ViewUpdate } from '@codemirror/view';
import { sourceMap } from './markdown-it-plugins';
import { Events as EditorEvents, Events } from '../Editor';
import type { Editor } from '../Editor';
import style from '../style.css';

interface PreviewerOption {
  text: string;
  editor: Editor;
}

export class Previewer extends EventEmitter {
  private readonly renderer = new MarkdownIt({ breaks: true }).use(sourceMap);
  private readonly el = document.createElement('article');
  private readonly editor: Editor;
  private readonly editorTop: number;
  constructor({ text, editor }: PreviewerOption) {
    super();

    this.editor = editor;
    this.editorTop = editor.view.scrollDOM.getBoundingClientRect().top;
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
      view: { scrollDOM, dom: containerEl },
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
    scrollDOM.addEventListener('scroll', this.scrollToTopLineInEditor);
  }

  private getLineEl(line: number) {
    for (let i = line; i >= 1; i--) {
      const el = this.el.querySelector(`[data-source-line="${i}"]`);
      if (el) {
        return el as HTMLElement;
      }
    }
    return null;
  }

  private highlightFocusedLine = (update: ViewUpdate) => {
    const className = style['previewer-focused-line'];
    const ranges = update.state.selection.ranges;
    const focusedLineEls = ranges
      .map(({ head }) => update.state.doc.lineAt(head).number)
      .map(this.getLineEl.bind(this));

    for (const el of this.el.querySelectorAll(`.${className}`)) {
      el.classList.remove(className);
    }

    for (const el of focusedLineEls) {
      if (el) {
        el.classList.add(className);
      }
    }
  };

  private scrollToTopLineInEditor = () => {
    const lineBlock = this.editor.view.visualLineAtHeight(this.editorTop);
    const line = this.editor.view.state.doc.lineAt(lineBlock.from);
    const lineEl = this.getLineEl(line.number);

    if (!lineEl) {
      return;
    }

    const top = lineEl.offsetTop;

    this.el.scrollTo({ top });
  };

  destroy() {
    this.editor.off(Events.StateChanged, this.highlightFocusedLine);
    this.editor.off(Events.DocChanged, this.render);
  }
}
