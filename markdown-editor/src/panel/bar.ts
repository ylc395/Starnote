import type { Panel } from '@codemirror/panel';
import type { EditorView, ViewUpdate } from '@codemirror/view';
import style from './style.css';

export interface BarItem {
  className?: string;
  title?: string;
  htmlContent?: string;
  htmlTag?: string;
  onMounted?: (view: EditorView, itemEl: HTMLElement) => void;
  onUpdate?: (update: ViewUpdate, itemEl: HTMLElement) => void;
  onClick?: (view: EditorView, itemEl: HTMLElement) => void;
}

interface BarOption {
  top?: boolean;
  itemClassName: string;
  className: string;
}

function bar(items: BarItem[], { top, itemClassName, className }: BarOption) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    barDom.className = className;

    const itemsDom = items.map((item) => {
      const dom = document.createElement(item.htmlTag || 'div');

      if (itemClassName) {
        dom.className = itemClassName;
      }

      if (item.htmlTag?.toLowerCase() === 'button') {
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
        dom.addEventListener('click', item.onClick.bind(null, view, dom));
      }

      return dom;
    });

    barDom.append(...itemsDom);

    return {
      dom: barDom,
      top,
      mount() {
        items.forEach((item, index) => {
          item.onMounted?.(view, itemsDom[index]);
        });
      },
      update(update) {
        items.forEach((item, index) =>
          item.onUpdate?.(update, itemsDom[index]),
        );
      },
    };
  };
}

interface Bar {
  items: BarItem[];
  classNamePrefix: string;
}

export const statusbar = ({ items, classNamePrefix }: Bar) => {
  return bar(items, {
    className: `${style['statusbar']} ${classNamePrefix}editor-statusbar`,
    itemClassName: `${classNamePrefix}editor-statusbar-item`,
  });
};

export const toolbar = ({ items, classNamePrefix }: Bar) => {
  return bar(items, {
    className: `${style['toolbar']} ${classNamePrefix}editor-toolbar`,
    itemClassName: `${classNamePrefix}editor-toolbar-item`,
    top: true,
  });
};
