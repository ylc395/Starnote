import { showPanel } from '@codemirror/panel';
import type { Panel } from '@codemirror/panel';
import type { EditorView, ViewUpdate } from '@codemirror/view';

export interface StatusbarItem {
  className?: string;
  onMounted?: (view: EditorView, itemEl: HTMLElement) => void;
  onUpdate?: (
    update: ViewUpdate,
    view: EditorView,
    itemEl: HTMLElement,
  ) => void;
}

function statusbar(items: StatusbarItem[]) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    const itemsDom = items.map((item) => {
      const dom = document.createElement('div');
      dom.classList.add('editor-statusbar-item');

      if (item.className) {
        dom.classList.add(item.className);
      }

      return dom;
    });

    barDom.classList.add('editor-statusbar');
    barDom.append(...itemsDom);

    return {
      dom: barDom,
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

export function getStatusbar(statusbarItems: StatusbarItem[]) {
  return showPanel.of(statusbar(statusbarItems));
}
