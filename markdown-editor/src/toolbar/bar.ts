import { showPanel } from '@codemirror/panel';
import type { Panel } from '@codemirror/panel';
import type { EditorView, Command } from '@codemirror/view';

export interface ToolbarItem {
  className: string;
  title: string;

  action: Command;
}

function toolbar(items: ToolbarItem[]) {
  return function (view: EditorView): Panel {
    const barDom = document.createElement('div');
    const itemsDom = items.map((item) => {
      const dom = document.createElement('div');
      dom.classList.add('editor-toolbar-item');
      dom.title = item.title;
      // todo: remove this
      dom.innerText = item.title;

      dom.addEventListener('click', item.action.bind(dom, view));

      if (item.className) {
        dom.classList.add(item.className);
      }

      return dom;
    });

    barDom.classList.add('editor-toolbar');
    barDom.append(...itemsDom);

    return {
      dom: barDom,
      top: true,
    };
  };
}

export function getToolbar(toolbarItems: ToolbarItem[]) {
  return showPanel.of(toolbar(toolbarItems));
}
