import { showPanel } from '@codemirror/panel';
import type { Panel } from '@codemirror/panel';
import type { EditorView } from '@codemirror/view';
import type { EditorOptions } from '../types';

export { wordCounter } from './wordCounter';

function statusbar(items: Required<EditorOptions>['statusbar']) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    const itemsDom = items.map(() => document.createElement('div'));

    items.forEach((item, index) => {
      itemsDom[index].classList.add(item.className);
      item.onInitialize(view, itemsDom[index]);
    });

    barDom.append(...itemsDom);

    return {
      dom: barDom,
      update(update) {
        items.forEach((item, index) =>
          item.onUpdate(update, view, itemsDom[index]),
        );
      },
    };
  };
}

export function getStatusbar(
  statusbarItems: Required<EditorOptions>['statusbar'],
) {
  return showPanel.of(statusbar(statusbarItems));
}
