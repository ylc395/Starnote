import type { Panel } from '@codemirror/panel';
import type { EditorView, ViewUpdate } from '@codemirror/view';

export interface BarItem {
  className?: string;
  title?: string;
  onMounted?: (view: EditorView, itemEl: HTMLElement) => void;
  onUpdate?: (
    update: ViewUpdate,
    view: EditorView,
    itemEl: HTMLElement,
  ) => void;
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
    barDom.classList.add(className);

    const itemsDom = items.map((item) => {
      const dom = document.createElement('div');

      if (itemClassName) {
        dom.classList.add(itemClassName);
      }

      if (item.title) {
        dom.title = item.title;
        // todo: remove this
        dom.textContent = item.title;
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
          item.onUpdate?.(update, view, itemsDom[index]),
        );
      },
    };
  };
}

export const statusbar = (items: BarItem[]) => {
  return bar(items, {
    className: 'editor-status',
    itemClassName: 'editor-status-item',
  });
};

export const toolbar = (items: BarItem[]) => {
  return bar(items, {
    className: 'editor-toolbar',
    itemClassName: 'editor-toolbar-item',
    top: true,
  });
};
