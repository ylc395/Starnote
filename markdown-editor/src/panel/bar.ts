import { showPanel } from '@codemirror/panel';
import type { Panel } from '@codemirror/panel';
import type { EditorView, ViewUpdate } from '@codemirror/view';
import style from './style.css';
import type { Editor } from '../editor';

export interface BarItem {
  className?: string;
  title?: string;
  htmlContent?: string;
  htmlTag?: string;
  onMounted?: (view: EditorView, itemEl: HTMLElement, editor: Editor) => void;
  onUpdate?: (update: ViewUpdate, itemEl: HTMLElement, editor: Editor) => void;
  onClick?: (view: EditorView, itemEl: HTMLElement, editor: Editor) => void;
}

interface BarOption {
  top?: boolean;
  itemClassName: string;
  className: string;
  itemTag: string;
}

function bar(
  items: BarItem[],
  { top, itemClassName, className, itemTag }: BarOption,
  editor: Editor,
) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    barDom.className = className;

    const itemsDom = items.map((item) => {
      const dom = document.createElement(item.htmlTag || itemTag);

      if (itemClassName) {
        dom.className = itemClassName;
      }

      if (dom.tagName.toLowerCase() === 'button') {
        dom.classList.add(style['toolbar-item-button']);
      }

      if (item.title) {
        dom.title = item.title;
      }

      if (item.htmlContent) {
        dom.innerHTML = item.htmlContent;
      }

      if (item.className) {
        dom.classList.add(...item.className.split(' '));
      }

      if (item.onClick) {
        dom.addEventListener(
          'click',
          item.onClick.bind(null, view, dom, editor),
        );
      }

      return dom;
    });

    barDom.append(...itemsDom);

    return {
      dom: barDom,
      top,
      mount() {
        items.forEach((item, index) => {
          item.onMounted?.(view, itemsDom[index], editor);
        });
      },
      update(update) {
        items.forEach((item, index) =>
          item.onUpdate?.(update, itemsDom[index], editor),
        );
      },
    };
  };
}

export const statusbar = (editor: Editor) => {
  const { statusbar: items, classNamePrefix } = editor.options;
  const option = {
    className: `${style['statusbar']} ${classNamePrefix}editor-statusbar`,
    itemClassName: `${classNamePrefix}editor-statusbar-item`,
    itemTag: 'div',
  };

  return showPanel.of(bar(items, option, editor));
};

export const toolbar = (editor: Editor) => {
  const { toolbar: items, classNamePrefix } = editor.options;
  const option = {
    className: `${style['toolbar']} ${classNamePrefix}editor-toolbar`,
    itemClassName: `${classNamePrefix}editor-toolbar-item`,
    itemTag: 'button',
    top: true,
  };

  return showPanel.of(bar(items, option, editor));
};
