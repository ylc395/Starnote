import MarkdownIt from 'markdown-it';
import type { ViewUpdate } from '@codemirror/view';
import { sourceMap } from './markdown-it-plugins';
import { Events as EditorEvents, Events } from '../Editor';
import type { Editor } from '../Editor';
import style from '../style.css';
import { getSyntaxTreeOfState } from '../state';
import type { SyntaxNode } from '../types';

interface PreviewerOption {
  text: string;
  editor: Editor;
}

export class Previewer {
  private readonly renderer = new MarkdownIt({ breaks: true }).use(sourceMap);
  private readonly el = document.createElement('article');
  private readonly editor: Editor;
  private readonly editorTop: number;
  constructor({ text, editor }: PreviewerOption) {
    this.editor = editor;
    this.editorTop = editor.view.scrollDOM.getBoundingClientRect().top;
    this.editor.on(EditorEvents.StateChanged, this.highlightFocusedLine);
    this.editor.on(EditorEvents.DocChanged, this.render);
    this.initDom();
    this.render(text);
  }
  render = (text: string) => {
    this.el.innerHTML = this.renderer.render(text);
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
        if (
          el.tagName === 'CODE' &&
          el.parentElement &&
          el.parentElement.tagName === 'PRE'
        ) {
          // Fenched code blocks are a special case since the `code-line` can only be marked on
          // the `<code>` element and not the parent `<pre>` element.
          return { el: el.parentElement, line: i };
        }

        return { el: el as HTMLElement, line: i };
      }
    }

    return null;
  }

  private getLineBlockOfEditorTop() {
    const view = this.editor.view;
    const block = view.visualLineAtHeight(this.editorTop);
    const syntaxTree = getSyntaxTreeOfState(view.state);
    const node = syntaxTree.resolve(block.from, 1);
    const getParentFencedCode = (node: SyntaxNode): SyntaxNode | null => {
      if (!node.parent) {
        return null;
      }

      if (node.parent.type.is('FencedCode')) {
        return node.parent;
      }

      return getParentFencedCode(node.parent);
    };
    const parentFencedCode = getParentFencedCode(node);

    if (parentFencedCode) {
      const contentDomTop = view.contentDOM.getBoundingClientRect().top;
      const firstBlock = view.visualLineAt(
        parentFencedCode.from,
        contentDomTop,
      );

      const lastBlock = view.visualLineAt(parentFencedCode.to, contentDomTop);

      return {
        from: firstBlock.from,
        top: firstBlock.top,
        height: lastBlock.bottom - firstBlock.top,
      };
    }

    return block;
  }

  private highlightFocusedLine = (update: ViewUpdate) => {
    const className = style['previewer-focused-line'];
    const ranges = update.state.selection.ranges;
    const focusedLines = ranges
      .map(({ head }) => update.state.doc.lineAt(head).number)
      .map((line) => this.getLineEl(line));

    for (const el of this.el.querySelectorAll(`.${className}`)) {
      el.classList.remove(className);
    }

    for (const line of focusedLines) {
      if (line) {
        line.el.classList.add(className);
      }
    }
  };

  private scrollToTopLineInEditor = () => {
    const lineBlock = this.getLineBlockOfEditorTop();
    const lineInEditor = this.editor.view.state.doc.lineAt(lineBlock.from);
    const lineInPreview = this.getLineEl(lineInEditor.number);

    if (!lineInPreview || lineInPreview.line < lineInEditor.number) {
      return;
    }

    const pastHeight = this.editorTop - lineBlock.top;
    const progress = pastHeight / lineBlock.height;
    const top =
      lineInPreview.el.offsetTop +
      Math.max(lineInPreview.el.clientHeight * progress, 0);

    this.el.scrollTo({ top });
  };

  destroy() {
    this.editor.off(Events.StateChanged, this.highlightFocusedLine);
    this.editor.off(Events.DocChanged, this.render);
    this.editor.view.scrollDOM.removeEventListener(
      'scroll',
      this.scrollToTopLineInEditor,
    );
  }
}
