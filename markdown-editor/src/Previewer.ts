import MarkdownIt from 'markdown-it';
import { Events as EditorEvents } from './Editor';
import type { Editor } from './Editor';

interface PreviewerOption {
  el: HTMLElement;
  text: string;
  editor: Editor;
}

export class Previewer {
  private readonly renderer = new MarkdownIt();
  private readonly el: HTMLElement;
  private readonly editor: Editor;
  constructor({ el, text, editor }: PreviewerOption) {
    this.el = el;
    this.el.className = 'editor-preview';
    this.render(text);
    this.editor = editor;
    this.editor.on(EditorEvents.Updated, this.render.bind(this));
  }
  render(text: string) {
    this.el.innerHTML = this.renderer.render(text);
  }
}
