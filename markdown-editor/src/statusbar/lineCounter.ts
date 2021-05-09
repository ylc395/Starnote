import type { EditorState } from '@codemirror/state';
import type { StatusbarItem } from './bar';

function getLines(state: EditorState) {
  return `lines: ${state.doc.lines}`;
}

export function lineCounter(): StatusbarItem {
  return {
    className: 'editor-statusbar-line-counter',
    onMounted(view, itemEl) {
      itemEl.textContent = getLines(view.state);
    },
    onUpdate(update, view, itemEl) {
      if (update.docChanged) {
        itemEl.textContent = getLines(update.state);
      }
    },
  };
}
