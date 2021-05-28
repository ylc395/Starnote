import MarkdownIt from 'markdown-it';
import type { ViewUpdate } from '@codemirror/view';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import { sourceMap } from './markdownItPlugins';
import { Events as EditorEvents } from '../editor';
import type { Editor } from '../editor';
import style from './style.css';
import { getNodeAt } from '../markdown/syntaxTree';
import type { SyntaxNode } from '../markdown/syntaxTree';

export class Previewer {
  private readonly renderer = new MarkdownIt({ breaks: true }).use(sourceMap);
  private readonly el = document.createElement('article');
  private editorTop = 0;
  private isScrolling = false;
  private readonly resizeObserver: ResizeObserver;
  constructor(private readonly editor: Editor) {
    this.resizeObserver = new ResizeObserver(this.layout.bind(this, false));
    this.render(editor.getContent());
    this.layout();
    this.initListeners();
  }
  render: (text: string) => void = debounce(
    (text: string) => {
      this.el.innerHTML = this.renderer.render(text);
      this.highlightFocusedLine();
    },
    200,
    { leading: true },
  );

  private layout(init = true) {
    const {
      view: { scrollDOM, dom: rootDOM, contentDOM },
    } = this.editor;

    if (init) {
      this.el.className = `${style['previewer']} ${this.editor.options.classNamePrefix}editor-previewer`;
      scrollDOM.after(this.el);
      scrollDOM.style.width = '50%';
    }

    window.requestAnimationFrame(() => {
      contentDOM.style.paddingBottom = `${scrollDOM.clientHeight}px`;

      const {
        top: rootTop,
        bottom: rootBottom,
      } = rootDOM.getBoundingClientRect();
      const {
        top: scrollTop,
        bottom: scrollBottom,
      } = scrollDOM.getBoundingClientRect();

      this.el.style.top = `${scrollTop - rootTop}px`;
      this.el.style.bottom = `${rootBottom - scrollBottom}px`;
      this.el.style.paddingBottom = `${this.el.clientHeight}px`;
      this.editorTop = scrollTop;
    });
  }

  private initListeners() {
    this.editor.on(EditorEvents.StateChanged, this.highlightFocusedLine);
    this.editor.on(EditorEvents.DocChanged, this.render);
    this.editor.on(EditorEvents.ContentSet, this.render);
    this.editor.view.scrollDOM.addEventListener(
      'scroll',
      this.scrollToTopLineOfEditor,
    );
    this.el.addEventListener('scroll', this.scrollToTopLineOfPreviewer);
    this.resizeObserver.observe(this.editor.view.dom);
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
    const node = getNodeAt(view.state, from, 1);
    const getParentFencedCode = (node: SyntaxNode): SyntaxNode | null => {
      if (node.type.is('FencedCode')) {
        return node;
      }

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

  private highlightFocusedLine = (update?: ViewUpdate) => {
    const state = update ? update.state : this.editor.view.state;
    const classNames = [
      style['focused-line'],
      `${this.editor.options.classNamePrefix}editor-previewer-focused-line`,
    ];
    const ranges = state.selection.ranges;
    const focusedLines = ranges
      .map(({ head }) => state.doc.lineAt(head).number)
      .map((line) => this.getLineEl(line));

    for (const el of this.el.querySelectorAll(`.${style['focused-line']}`)) {
      (el as HTMLElement).classList.remove(...classNames);
    }

    for (const line of focusedLines) {
      if (line) {
        line.el.classList.add(...classNames);
      }
    }
  };

  private scrollToTopLineOfEditor = throttle(() => {
    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

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
    this.isScrolling = true;
  }, 50);

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

  private scrollToTopLineOfPreviewer = throttle(() => {
    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

    const firstLineEl = this.getFirstVisibleLineInPreviewer();

    if (!firstLineEl || !firstLineEl.dataset.sourceLine) {
      return;
    }

    const line = Number(firstLineEl.dataset.sourceLine);
    const lineInEditor = this.editor.view.state.doc.line(line);
    const block = this.editor.view.visualLineAt(lineInEditor.from);
    const { top, height } = firstLineEl.getBoundingClientRect();
    const progress = (this.editorTop - top) / height;

    this.editor.view.scrollDOM.scrollTo({
      top: block.top + block.height * progress,
    });
    this.isScrolling = true;
  }, 50);

  destroy() {
    this.el.removeEventListener('scroll', this.scrollToTopLineOfPreviewer);
    this.editor.off(EditorEvents.StateChanged, this.highlightFocusedLine);
    this.editor.off(EditorEvents.DocChanged, this.render);
    this.editor.off(EditorEvents.ContentSet, this.render);
    this.editor.view.scrollDOM.removeEventListener(
      'scroll',
      this.scrollToTopLineOfEditor,
    );
    this.resizeObserver.disconnect();
  }

  get isFull() {
    return this.el.classList.contains(style['previewer-full']);
  }
  get isHidden() {
    return this.el.classList.contains(style['previewer-invisible']);
  }

  toggleLayout() {
    if (this.isHidden) {
      this.el.classList.remove(style['previewer-invisible']);
      this.el.classList.add(style['previewer-full']);
    } else if (this.isFull) {
      this.el.classList.remove(style['previewer-full']);
      this.editor.view.scrollDOM.style.width = '50%';
    } else {
      this.el.classList.add(style['previewer-invisible']);
      this.editor.view.scrollDOM.style.width = 'auto';
    }
  }
}
