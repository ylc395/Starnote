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

    this.layout();
    this.initListeners();
    this.render(text);
  }
  render = (text: string) => {
    this.el.innerHTML = this.renderer.render(text);
  };

  private layout() {
    const {
      view: { scrollDOM, dom: rootDOM, contentDOM },
    } = this.editor;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const topPanel = rootDOM.querySelector('.cm-panels-top')!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bottomPanel = rootDOM.querySelector('.cm-panels-bottom')!;

    this.el.className = style['previewer'];
    this.el.style.top = `${topPanel.clientHeight}px`;
    this.el.style.bottom = `${bottomPanel.clientHeight}px`;

    scrollDOM.after(this.el);
    scrollDOM.style.width = '50%';
    window.requestAnimationFrame(() => {
      contentDOM.style.paddingBottom = `${scrollDOM.clientHeight}px`;
      this.el.style.paddingBottom = `${this.el.clientHeight}px`;
    });
  }

  private initListeners() {
    this.editor.on(EditorEvents.StateChanged, this.highlightFocusedLine);
    this.editor.on(EditorEvents.DocChanged, this.render);
    this.editor.view.scrollDOM.addEventListener(
      'scroll',
      this.scrollToTopLineOfEditor,
    );
    this.el.addEventListener('scroll', this.scrollToTopLineOfPreviewer);
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
    const { top, from, height } = view.visualLineAtHeight(this.editorTop);
    const syntaxTree = getSyntaxTreeOfState(view.state);
    const node = syntaxTree.resolve(from, 1);
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
      const { number } = this.editor.view.state.doc.lineAt(firstBlock.from);

      return {
        from: firstBlock.from,
        top: firstBlock.top,
        height: lastBlock.bottom - firstBlock.top,
        line: number,
      };
    }

    const { number } = this.editor.view.state.doc.lineAt(from);
    return { from, top, height, line: number };
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

  private scrollToTopLineOfEditor = () => {
    const lineBlock = this.getLineBlockOfEditorTop();
    const lineInPreview = this.getLineEl(lineBlock.line);

    if (!lineInPreview || lineInPreview.line < lineBlock.line) {
      return;
    }

    const lineEl = lineInPreview.el;
    const pastHeight = this.editorTop - lineBlock.top;
    const progress = pastHeight / lineBlock.height;

    this.el.scrollTo({
      top: lineEl.offsetTop + lineEl.clientHeight * progress,
    });
  };

  private getFirstVisibleLineInPreviewer() {
    const children = [...this.el.children] as HTMLElement[];
    const find = (els: HTMLElement[]): HTMLElement | null => {
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        const isInFirstLine = top - this.editorTop + el.clientHeight > 0;

        if (!isInFirstLine) {
          continue;
        }

        if ((el as HTMLElement).dataset.sourceLine) {
          return el;
        }

        if (el.children.length > 0) {
          const childLine = find([...el.children] as HTMLElement[]);

          if (childLine) {
            return childLine;
          }
        }
      }

      return null;
    };

    return find(children);
  }

  private scrollToTopLineOfPreviewer = () => {
    const firstLineEl = this.getFirstVisibleLineInPreviewer();

    if (!firstLineEl) {
      return;
    }

    const line = Number(
      firstLineEl.dataset.sourceLine ??
        (firstLineEl.firstElementChild &&
          (firstLineEl.firstElementChild as HTMLElement).dataset.sourceLine),
    );

    const lineInEditor = this.editor.view.state.doc.line(line);
    const block = this.editor.view.visualLineAt(lineInEditor.from);
    const { top, height } = firstLineEl.getBoundingClientRect();
    const progress = (this.editorTop - top) / height;

    this.editor.view.scrollDOM.scrollTo({
      top: block.top + block.height * progress,
    });
  };

  destroy() {
    this.el.remove();
    this.el.removeEventListener('scroll', this.scrollToTopLineOfPreviewer);
    this.editor.off(Events.StateChanged, this.highlightFocusedLine);
    this.editor.off(Events.DocChanged, this.render);
    this.editor.view.scrollDOM.removeEventListener(
      'scroll',
      this.scrollToTopLineOfEditor,
    );
  }
}
