import { showPanel } from '@codemirror/panel';
import type { Panel } from '@codemirror/panel';
import type { EditorView, ViewUpdate } from '@codemirror/view';
import style from './style.module.css';
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
  barClassName: string;
  defaultItemTag: string;
}

function bar(
  items: BarItem[],
  { top, itemClassName, barClassName, defaultItemTag }: BarOption,
  editor: Editor,
) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    barDom.className = barClassName;

    const itemsDom = items.map((item) => {
      const dom = document.createElement(item.htmlTag || defaultItemTag);

      if (itemClassName) {
        dom.className = itemClassName;
      }

      if (dom.tagName.toLowerCase() === 'button') {
        dom.classList.add(style['bar-item-button']);
      }

      if (item.title) {
        dom.title = item.title;
      }

      if (item.htmlContent) {
        dom.innerHTML = item.htmlContent;
      }

      if (item.className) {
        dom.classList.add(
          ...item.className
            .split(' ')
            .map((cls) => `${editor.options.classNamePrefix}${cls}`),
        );
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
    barClassName: `${style['statusbar']} ${classNamePrefix}statusbar`,
    itemClassName: `${classNamePrefix}statusbar-item ${style['bar-item']}`,
    defaultItemTag: 'div',
  };

  return showPanel.of(bar(items, option, editor));
};

export const toolbar = (editor: Editor) => {
  const { toolbar: items, classNamePrefix } = editor.options;
  const option = {
    barClassName: `${style['toolbar']} ${classNamePrefix}toolbar`,
    itemClassName: `${classNamePrefix}toolbar-item ${style['bar-item']}`,
    defaultItemTag: 'button',
    top: true,
  };

  return showPanel.of(bar(items, option, editor));
};
