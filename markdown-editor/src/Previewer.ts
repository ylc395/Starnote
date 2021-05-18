import MarkdownIt from 'markdown-it';
import { Events as EditorEvents } from './Editor';
import type { Editor } from './Editor';
import style from './style.css';

interface PreviewerOption {
  text: string;
  editor: Editor;
}

export class Previewer {
  private readonly renderer = new MarkdownIt();
  private readonly el = document.createElement('div');
  private readonly editor: Editor;
  constructor({ text, editor }: PreviewerOption) {
    this.editor = editor;
    this.editor.on(EditorEvents.Updated, this.render.bind(this));

    this.initDom();
    this.render(text);
  }
  render(text: string) {
    this.el.innerHTML = this.renderer.render(text);
  }

  private initDom() {
    const editorDom = this.editor.view.scrollDOM;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const topPanel = this.editor.el.querySelector('.cm-panels-top')!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bottomPanel = this.editor.el.querySelector('.cm-panels-bottom')!;

    this.el.className = style['previewer'];
    this.el.style.top = `${topPanel.clientHeight}px`;
    this.el.style.bottom = `${bottomPanel.clientHeight}px`;

    editorDom.after(this.el);
    editorDom.style.width = '50%';
  }
}
